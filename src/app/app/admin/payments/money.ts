// 1234 → "1,234", 29.5 → "29.50"
export function money(n: number) {
  const cents = !Number.isInteger(n);
  return n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
}
