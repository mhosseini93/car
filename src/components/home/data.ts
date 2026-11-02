export type Car = {
  id: string
  name: string
  year: number
  condition: "new" | "used"
  mileage?: number
  price: number
  minDownPercent: number
  gearbox: string
  fuel: string
  color: string
  tags: string[]
}

export const cars: Car[] = [
  {
    id: "207",
    name: "پژو ۲۰۷ اتوماتیک",
    year: 1405,
    condition: "new",
    price: 1_450_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#e5e7eb",
    tags: ["تحویل فوری"],
  },
  {
    id: "tara",
    name: "تارا اتوماتیک",
    year: 1405,
    condition: "new",
    price: 1_650_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#1e3a8a",
    tags: ["پرفروش"],
  },
  {
    id: "shahin",
    name: "شاهین G",
    year: 1405,
    condition: "new",
    price: 1_100_000_000,
    minDownPercent: 25,
    gearbox: "دستی",
    fuel: "بنزین",
    color: "#b91c1c",
    tags: ["اقتصادی"],
  },
  {
    id: "dena",
    name: "دنا پلاس توربو",
    year: 1405,
    condition: "new",
    price: 1_550_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#111827",
    tags: ["تحویل ۷ روزه"],
  },
  {
    id: "quick",
    name: "کوییک R",
    year: 1403,
    condition: "used",
    mileage: 25_000,
    price: 780_000_000,
    minDownPercent: 35,
    gearbox: "دستی",
    fuel: "بنزین",
    color: "#f8fafc",
    tags: ["کارشناسی‌شده"],
  },
  {
    id: "s7",
    name: "هایما S7 توربو",
    year: 1404,
    condition: "used",
    mileage: 12_000,
    price: 2_400_000_000,
    minDownPercent: 40,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#64748b",
    tags: ["شاسی‌بلند"],
  },
]

export const faqs = [
  {
    q: "برای خرید اقساطی به ضامن نیاز دارم؟",
    a: "خیر. برای بیشتر طرح‌ها فقط چک صیادی خودتان کافی است و نیازی به ضامن یا کسر از حقوق ندارید.",
  },
  {
    q: "حداقل پیش‌پرداخت چقدر است؟",
    a: "بسته به خودرو، پیش‌پرداخت از ۲۵ درصد قیمت شروع می‌شود. هرچه پیش‌پرداخت بیشتر باشد، قسط ماهانه کمتر است.",
  },
  {
    q: "اقساط حداکثر چند ماهه است؟",
    a: "می‌توانید بازپرداخت را بین ۱۲ تا ۴۸ ماه انتخاب کنید.",
  },
  {
    q: "خودرو چه زمانی تحویل داده می‌شود؟",
    a: "خودروهای «تحویل فوری» حداکثر ۷۲ ساعت پس از تکمیل مدارک و بقیه خودروها طبق زمان‌بندی درج‌شده در قرارداد تحویل می‌شوند.",
  },
  {
    q: "سند خودرو به نام چه کسی است؟",
    a: "سند از روز اول به نام خریدار صادر می‌شود و تا پایان اقساط در رهن باقی می‌ماند.",
  },
]
