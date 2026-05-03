const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INDEX_PATH = path.join(ROOT, 'index.html');

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  const env = {};
  if (!fs.existsSync(envPath)) return env;

  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value;
  }
  return env;
}

const ENV = loadEnv();
const PORT = Number(ENV.PORT || 3000);
const GEMINI_API_KEY = ENV.GEMINI_API_KEY || '';
const GEMINI_MODEL = ENV.GEMINI_MODEL || 'gemini-2.5-flash-lite';

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(sanitizeJsonValue(payload)));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 500, { error: 'Failed to read index.html' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map(part => part?.text || '').join('\n').trim();
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error('Request body too large.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleGenerateQuestions(req, res) {
  if (!GEMINI_API_KEY) {
    sendJson(res, 500, { error: 'Missing GEMINI_API_KEY in .env' });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const body = JSON.parse(rawBody || '{}');
    const prompt = String(body.prompt || '').trim();
    const maxQ = Math.max(1, Math.min(10, Number(body.maxQ || 1)));
    if (!prompt) {
      sendJson(res, 400, { error: 'Prompt is required.' });
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
      sendJson(res, upstream.status, {
        error: gemini?.error?.message || 'Gemini request failed.',
        code: gemini?.error?.code || upstream.status
      });
      return;
    }

    const rawText = stripCodeFence(extractGeminiText(gemini));
    const questions = safeParseGeminiJson(rawText);

    if (!Array.isArray(questions)) {
      sendJson(res, 502, { error: 'Gemini returned a non-array question payload.' });
      return;
    }

    sendJson(res, 200, { questions });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Unexpected server error.' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    sendFile(res, INDEX_PATH);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/generate-questions') {
    await handleGenerateQuestions(req, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Quantix running at http://localhost:${PORT}`);
});
