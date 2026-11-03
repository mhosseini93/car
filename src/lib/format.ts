export const fa = (n: number) => Math.round(n).toLocaleString("fa-IR")

// Years and codes: Persian digits without a thousands separator (۱۴۰۵, not ۱٬۴۰۵)
export const faYear = (n: number) => n.toLocaleString("fa-IR", { useGrouping: false })

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

export const ESTIMATE_MONTHS = [12, 18, 24, 36, 48]

type PlanSource = {
  price: number
  minDownPercent: number
  // Monthly amounts set for this car (toman); empty means "use the estimate"
  installments?: { months: number; amount: number }[]
}

export type InstallmentPlan = { months: number; monthly: number; down: number; total: number; estimated: boolean }

// The car's own installment table when it has one, otherwise the site-wide estimate; shortest first
export function installmentPlans(car: PlanSource): InstallmentPlan[] {
  const down = (car.price * car.minDownPercent) / 100
  const plans = car.installments?.length
    ? car.installments.map(({ months, amount }) => ({
        months,
        monthly: amount,
        down,
        total: down + amount * months,
        estimated: false,
      }))
    : ESTIMATE_MONTHS.map((months) => {
        const plan = calcInstallment(car.price, car.minDownPercent, months)
        return { months, monthly: plan.monthly, down, total: down + plan.total, estimated: true }
      })
  return plans.sort((a, b) => a.months - b.months)
}

// Lowest monthly payment, shown as «قسط ماهانه از» on cards and tables
export function lowestInstallment(car: PlanSource): InstallmentPlan {
  return installmentPlans(car).reduce((low, plan) => (plan.monthly < low.monthly ? plan : low))
}

// Persian (Jalali) calendar date, e.g. «۱۱ آبان ۱۴۰۵»
export const faDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })
