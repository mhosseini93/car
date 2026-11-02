export const fa = (n: number) => Math.round(n).toLocaleString("fa-IR")

export const toman = (n: number) => `${fa(n)} تومان`

export const million = (n: number) => `${fa(n / 1_000_000)} میلیون`

// Simple-interest estimate used across the site (sample annual rate)
export const ANNUAL_RATE = 0.23

export function calcInstallment(price: number, downPercent: number, months: number) {
  const down = (price * downPercent) / 100
  const principal = price - down
  const total = principal * (1 + (ANNUAL_RATE * months) / 12)
  return { down, principal, total, monthly: total / months }
}
