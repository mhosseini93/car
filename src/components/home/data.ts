// Sample catalog data; replace with real data from the backend

export type Brand = {
  slug: string
  name: string
  description: string
  color: string
}

export type Car = {
  id: string
  name: string
  brand: Brand["slug"]
  year: number
  condition: "new" | "used"
  mileage?: number
  price: number
  minDownPercent: number
  gearbox: string
  fuel: string
  color: string
  tags: string[]
  // Page views in the last 7 days, used to rank popular cars
  weeklyViews: number
}

export const brands: Brand[] = [
  {
    slug: "iran-khodro",
    name: "ایران‌خودرو",
    description:
      "خرید اقساطی محصولات ایران‌خودرو مثل پژو ۲۰۷، تارا و دنا پلاس با پیش‌پرداخت کم و تحویل سریع.",
    color: "#1d4ed8",
  },
  {
    slug: "saipa",
    name: "سایپا",
    description:
      "خرید اقساطی خودروهای سایپا مثل شاهین و کوییک، صفر و کارکرده، بدون ضامن و با اقساط تا ۴۸ ماه.",
    color: "#0f766e",
  },
  {
    slug: "modiran-khodro",
    name: "مدیران‌خودرو",
    description:
      "خرید اقساطی شاسی‌بلندها و سواری‌های مدیران‌خودرو با شرایط شفاف و پیش‌پرداخت مناسب.",
    color: "#b91c1c",
  },
  {
    slug: "kerman-motor",
    name: "کرمان موتور",
    description:
      "خرید اقساطی محصولات کرمان موتور با بازپرداخت منعطف و سند به نام خریدار از روز اول.",
    color: "#7c3aed",
  },
  {
    slug: "fownix",
    name: "فونیکس",
    description:
      "خرید اقساطی خودروهای فونیکس، از سواری تا شاسی‌بلند، با تحویل فوری مدل‌های موجود.",
    color: "#c2410c",
  },
  {
    slug: "bahman-motor",
    name: "بهمن موتور",
    description:
      "خرید اقساطی محصولات بهمن موتور با پیش‌پرداخت از ۳۰ درصد و اقساط ثابت ماهانه.",
    color: "#0369a1",
  },
]

export const cars: Car[] = [
  {
    id: "207",
    name: "پژو ۲۰۷ اتوماتیک",
    brand: "iran-khodro",
    year: 1405,
    condition: "new",
    price: 1_450_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#e5e7eb",
    tags: ["تحویل فوری"],
    weeklyViews: 18_400,
  },
  {
    id: "tara",
    name: "تارا اتوماتیک",
    brand: "iran-khodro",
    year: 1405,
    condition: "new",
    price: 1_650_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#1e3a8a",
    tags: ["پرفروش"],
    weeklyViews: 15_900,
  },
  {
    id: "shahin",
    name: "شاهین G",
    brand: "saipa",
    year: 1405,
    condition: "new",
    price: 1_100_000_000,
    minDownPercent: 25,
    gearbox: "دستی",
    fuel: "بنزین",
    color: "#b91c1c",
    tags: ["اقتصادی"],
    weeklyViews: 13_200,
  },
  {
    id: "dena",
    name: "دنا پلاس توربو",
    brand: "iran-khodro",
    year: 1405,
    condition: "new",
    price: 1_550_000_000,
    minDownPercent: 30,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#111827",
    tags: ["تحویل ۷ روزه"],
    weeklyViews: 9_800,
  },
  {
    id: "quick",
    name: "کوییک R",
    brand: "saipa",
    year: 1403,
    condition: "used",
    mileage: 25_000,
    price: 780_000_000,
    minDownPercent: 35,
    gearbox: "دستی",
    fuel: "بنزین",
    color: "#f8fafc",
    tags: ["کارشناسی‌شده"],
    weeklyViews: 7_300,
  },
  {
    id: "s7",
    name: "هایما S7 توربو",
    brand: "iran-khodro",
    year: 1404,
    condition: "used",
    mileage: 12_000,
    price: 2_400_000_000,
    minDownPercent: 40,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#64748b",
    tags: ["شاسی‌بلند"],
    weeklyViews: 6_100,
  },
  {
    id: "x55",
    name: "ام‌وی‌ام X55 پرو",
    brand: "modiran-khodro",
    year: 1405,
    condition: "new",
    price: 2_850_000_000,
    minDownPercent: 35,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#f1f5f9",
    tags: ["شاسی‌بلند"],
    weeklyViews: 14_700,
  },
  {
    id: "j7",
    name: "کی‌ام‌سی J7",
    brand: "kerman-motor",
    year: 1405,
    condition: "new",
    price: 2_650_000_000,
    minDownPercent: 35,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#334155",
    tags: ["شاسی‌بلند"],
    weeklyViews: 11_500,
  },
  {
    id: "tiggo7",
    name: "تیگو ۷ پرو",
    brand: "fownix",
    year: 1405,
    condition: "new",
    price: 3_100_000_000,
    minDownPercent: 40,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#7f1d1d",
    tags: ["تحویل فوری"],
    weeklyViews: 12_800,
  },
  {
    id: "prime",
    name: "فیدلیتی پرایم",
    brand: "bahman-motor",
    year: 1405,
    condition: "new",
    price: 3_400_000_000,
    minDownPercent: 40,
    gearbox: "اتوماتیک",
    fuel: "بنزین",
    color: "#e2e8f0",
    tags: ["۷ نفره"],
    weeklyViews: 8_900,
  },
]

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug)

export const getBrandCars = (slug: string) => cars.filter((c) => c.brand === slug)

export const popularCars = [...cars].sort((a, b) => b.weeklyViews - a.weeklyViews).slice(0, 8)

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
