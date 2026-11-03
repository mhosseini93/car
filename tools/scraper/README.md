# اسکرپر محصولات و دسته‌بندی‌ها

آدرس‌ها را از `sitemap.xml` (یا sitemap index) می‌خواند، صفحات محصول و دسته‌بندی را استخراج می‌کند و همه را در یک فایل JSON ذخیره می‌کند.

```bash
cd tools/scraper
npm install
node scrape.mjs https://mobinkhodro.com/sitemap.xml --cache .cache
```

خروجی پیش‌فرض: `output/<دامنه>.json`

## گزینه‌ها

| گزینه | توضیح |
| --- | --- |
| `-c, --config <file>` | فایل JSON برای بازنویسی تنظیمات پیش‌فرض |
| `-o, --out <file>` | مسیر فایل خروجی |
| `--cache <dir>` | HTML صفحات ذخیره و در اجرای بعدی بدون درخواست دوباره استفاده می‌شود (برای تنظیم selectorها مفید است) |
| `--limit <n>` | حداکثر تعداد صفحه از هر نوع، برای تست سریع |
| `--concurrency <n>` / `--delay <ms>` | تعداد درخواست هم‌زمان و مکث بین درخواست‌ها |

## ساختار خروجی

- `categories[]`: عنوان، متا (title، description، keywords، canonical، og، twitter)، مسیر راهنما، امتیاز، متن معرفی، `items` (لیست محصولات با عنوان، آدرس، خلاصه و تصویر؛ همه صفحات صفحه‌بندی دنبال می‌شوند)، `totalCount` و `productSlugs`.
- `products[]`: عنوان، `name`، `sku`، `description`، `offer` (قیمت، واحد، موجودی)، `images`، `categories` (از مسیر راهنما و لیست دسته‌بندی‌ها)، `rating`، `questions` (پرسش‌وپاسخ کاربران و FAQ، بدون نام افراد) و `content`:
  - `html`: متن کامل مقاله با آدرس‌های مطلق و بدون style/class/script
  - `text`، `headings`، `sections` (متن هر تیتر)، `images`، `tables` (جدول مشخصات فنی به‌صورت ردیف)، `links`
- هر صفحه `jsonLd` خام خود را هم دارد. `errors[]` صفحاتی را که خوانده نشدند فهرست می‌کند.

## استفاده برای سایت‌های مشابه

هر کلیدی از `DEFAULT_CONFIG` در `scrape.mjs` را می‌توان در یک فایل config بازنویسی کرد؛ کلیدهای نیامده از پیش‌فرض گرفته می‌شوند. برای هر selector آرایه‌ای از گزینه‌ها داده می‌شود و اولین گزینه‌ای که نتیجه دارد استفاده می‌شود.

```json
{
  "pageTypes": { "cars": "product", "brand": "category" },
  "ignoreCategorySlugs": ["all"],
  "request": { "concurrency": 1, "delayMs": 1000 },
  "selectors": {
    "content": [".car-description", "article"],
    "listItem": [".car-card"],
    "listItemTitle": [".car-card__title"],
    "pagination": [".pagination a[href]"]
  }
}
```

```bash
node scrape.mjs https://example.com/sitemap.xml -c other-site.json
```

نمونه کامل برای یک سایت وردپرسی: [configs/sepandkhodro.json](configs/sepandkhodro.json)

```bash
node scrape.mjs https://sepandkhodro.com/page-sitemap.xml https://sepandkhodro.com/cars-sitemap.xml -c configs/sepandkhodro.json --cache .cache
```

امکانات config:
- `pageTypes` به‌صورت آرایه قوانین regex: `[{ "match": "^/cars/[^/]+/?$", "type": "product" }]`. نوع `auto` صفحه را اگر لیست محصول داشت دسته‌بندی و وگرنه صفحه عمومی (`pages[]`) حساب می‌کند و `null` صفحه را رد می‌کند.
- `specs`: جفت‌های «عنوان: مقدار» مشخصات فنی با گروه‌بندی.
- `pricing`: قیمت نقدی، پیش‌پرداخت و جدول اقساط.
- `faq`: سوالات متداول آکاردئونی.
- `productCategories`: لینک برند یا دسته‌بندی در صفحه محصول.
- `promoteToHeading`: تبدیل تیترهای غیر h (مثل div) به h2 در محتوا.
- `listItemPrice` و `listItemSpecs`: قیمت و مشخصات کارت‌های لیست محصولات.
- `lazyImageAttributes`: صفاتی که آدرس واقعی تصاویر lazy-load را نگه می‌دارند.

آدرس‌های محصولی که به صفحه دیگری ریدایرکت می‌شوند به‌جای `products` در `redirects[]` ثبت می‌شوند.

`pageTypes` اولین بخش مسیر آدرس (مثلاً `/product/...`) را به نوع صفحه نگاشت می‌کند. داده‌هایی مثل متا، JSON-LD، مسیر راهنما، امتیاز و پرسش‌وپاسخ schema.org بدون نیاز به selector از هر سایتی خوانده می‌شوند.
