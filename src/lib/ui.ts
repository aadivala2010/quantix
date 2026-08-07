/** Darken a hex colour — used for the "wall" under every pressable surface. */
export function darken(hex: string, amount = 0.8): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * amount));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');
