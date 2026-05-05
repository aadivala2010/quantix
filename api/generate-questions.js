const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const requestBuckets = new Map();

function sanitizeJsonValue(value) {
  if (typeof value === 'string') {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, sanitizeJsonValue(inner)]));
  }
  return value;
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders
  });
  response.end(JSON.stringify(sanitizeJsonValue(payload)));
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part?.text || '').join('\n').trim();
  if (!text) throw new Error('Gemini returned no text content.');
  return text;
}

function stripCodeFence(text) {
  return String(text || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
}

function repairCommonJsonEscapes(text) {
  return String(text || '').replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
}

function stripControlCharacters(text) {
  return String(text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');
}

function safeParseGeminiJson(text) {
  const attempts = [
    String(text || ''),
    repairCommonJsonEscapes(String(text || '')),
    stripControlCharacters(String(text || '')),
    stripControlCharacters(repairCommonJsonEscapes(String(text || '')))
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unable to parse Gemini JSON payload.');
}

function getClientIp(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const socketIp = request.socket?.remoteAddress || '';
  return forwarded || socketIp || 'unknown';
}

function cleanupExpiredRateLimits(now = Date.now()) {
  for (const [ip, bucket] of requestBuckets.entries()) {
    if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) requestBuckets.delete(ip);
  }
}

function applyRateLimit(request, response) {
  const now = Date.now();
  cleanupExpiredRateLimits(now);
  const ip = getClientIp(request);
  const existing = requestBuckets.get(ip);
  const bucket = (!existing || now - existing.startedAt >= RATE_LIMIT_WINDOW_MS)
    ? { count: 0, startedAt: now }
    : existing;

  requestBuckets.set(ip, bucket);
  bucket.count += 1;

  const resetAt = bucket.startedAt + RATE_LIMIT_WINDOW_MS;
  const headers = {
    'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - bucket.count)),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000))
  };

  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    headers['Retry-After'] = String(Math.max(1, Math.ceil((resetAt - now) / 1000)));
    sendJson(response, 429, {
      error: 'Too many quiz generation requests. Please wait a minute and try again.'
    }, headers);
    return false;
  }

  Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value));
  return true;
}

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed.' });
    return;
  }

  if (!applyRateLimit(request, response)) return;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  if (!GEMINI_API_KEY) {
    sendJson(response, 500, { error: 'Missing GEMINI_API_KEY environment variable.' });
    return;
  }

  try {
    const body = typeof request.body === 'object' && request.body !== null
      ? request.body
      : JSON.parse(request.body || '{}');

    const prompt = String(body.prompt || '').trim();
    const maxQ = Math.max(1, Math.min(10, Number(body.maxQ || 1)));

    if (!prompt) {
      sendJson(response, 400, { error: 'Prompt is required.' });
      return;
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: 'You generate high-quality math questions for students. Respond with valid JSON only, never use markdown fences, and write math in plain Unicode text without LaTeX, dollar-sign delimiters, or backslash commands.'
            }]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  difficulty: { type: 'string' },
                  explanation: { type: 'string' }
                },
                required: ['question', 'answer', 'options', 'difficulty', 'explanation']
              },
              minItems: maxQ,
              maxItems: maxQ
            }
          },
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const gemini = await upstream.json();
    if (!upstream.ok) {
      sendJson(response, upstream.status, {
        error: gemini?.error?.message || 'Gemini request failed.',
        code: gemini?.error?.code || upstream.status
      });
      return;
    }

    const rawText = stripCodeFence(extractGeminiText(gemini));
    const questions = safeParseGeminiJson(rawText);

    if (!Array.isArray(questions)) {
      sendJson(response, 502, { error: 'Gemini returned a non-array question payload.' });
      return;
    }

    sendJson(response, 200, { questions });
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Unexpected server error.' });
  }
};
