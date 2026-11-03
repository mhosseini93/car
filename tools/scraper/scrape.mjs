#!/usr/bin/env node
// اسکرپر قابل‌پیکربندی: آدرس‌ها را از یک یا چند sitemap می‌خواند، صفحات محصول، دسته‌بندی و
// صفحات عمومی را استخراج می‌کند و همه را در یک فایل JSON ذخیره می‌کند.
//
// اجرا:
//   node scrape.mjs https://mobinkhodro.com/sitemap.xml
//   node scrape.mjs <sitemap> [<sitemap> ...] --config configs/other-site.json --cache .cache
//
// برای سایت‌های مشابه فقط کافی است selectorها و نگاشت مسیرها را در یک فایل config بازنویسی کنید
// (هر کلیدی که در config نیاید از DEFAULT_CONFIG گرفته می‌شود؛ آرایه‌ها کامل جایگزین می‌شوند).

import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const DEFAULT_CONFIG = {
  // نوع هر صفحه. دو شکل پشتیبانی می‌شود:
  //   - شیء: اولین بخش مسیر آدرس ← نوع، مثل { "product": "product" }
  //   - آرایه قوانین: [{ "match": "<regex روی مسیر decode شده>", "type": "..." }]؛ اولین قانون منطبق برنده است.
  // نوع‌ها: product، category، page، auto (اگر لیست محصول داشت category وگرنه page)، null (رد شود).
  // صفحاتی که هیچ قانونی شاملشان نشود اسکرپ نمی‌شوند.
  pageTypes: {
    product: "product",
    catproduct: "category",
  },
  // محصولاتی که در لیست دسته‌بندی‌ها پیدا می‌شوند ولی در sitemap نیستند هم خوانده شوند.
  followListedProducts: true,
  // slug دسته‌بندی‌های کلی (مثل «همه محصولات») که نباید به‌عنوان دسته‌بندی محصول ثبت شوند
  ignoreCategorySlugs: ["all"],
  // حداکثر تعداد صفحات صفحه‌بندی هر دسته‌بندی
  maxCategoryPages: 50,
  // صفات تصاویر lazy-load که آدرس واقعی تصویر را نگه می‌دارند (به ترتیب اولویت)
  lazyImageAttributes: ["data-lazy-src", "data-src", "data-original", "data-lazy"],
  request: {
    concurrency: 2,
    delayMs: 400,
    timeoutMs: 30000,
    retries: 3,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  },
  // در هر کلید آرایه‌ای، اولین selector که نتیجه داشته باشد استفاده می‌شود.
  selectors: {
    title: ["h1"],
    // همه عناصر منطبق با selector برنده (به ترتیب صفحه) کنار هم به‌عنوان محتوا ذخیره می‌شوند.
    content: ["article", "main article", "main", ".post-content", ".entry-content", "#content"],
    removeFromContent: ["script", "style", "noscript", "iframe", "form", ".mobin-toc", "nav"],
    // عناصری از محتوا که تیتر بخش هستند ولی تگ h ندارند؛ به h2 تبدیل می‌شوند.
    promoteToHeading: [],
    mainImage: [".DetailPic img", ".product-gallery img", ".woocommerce-product-gallery img"],
    gallery: ["a.popup-media", ".product-gallery a", ".woocommerce-product-gallery a"],
    ratingValue: [".RatingStarResult"],
    ratingCount: [".RatingStarResultCount"],
    breadcrumb: [".HeaderDownBoxRight a", ".breadcrumb a", "nav[aria-label='breadcrumb'] a"],
    // لینک دسته‌بندی/برند در صفحه محصول (علاوه بر مسیر راهنما)
    productCategories: [],
    // جفت‌های «عنوان: مقدار» مشخصات فنی. هر منبع: { item, label, value, group?, groupName? }
    // group: selector تیتر گروه که قبل از لیست آمده؛ groupName: نام ثابت گروه.
    specs: [],
    // بلوک قیمت و اقساط: { container, title, fieldItem, fieldLabel, fieldValue, installmentsTable }
    pricing: null,
    // آیتم‌های لیست محصولات در صفحه دسته‌بندی
    listItem: [".ProductShow .ItemAds", "ul.products li.product", ".product-list .product"],
    listItemLink: ["a[href]"],
    listItemTitle: [".ItemTitle", ".woocommerce-loop-product__title", "h2", "h3"],
    listItemSummary: [".ItemTitle2", ".excerpt", "p"],
    listItemImage: ["img"],
    listItemPrice: [],
    listItemSpecs: [],
    pagination: [".Paging a[href]", ".pagination a[href]", "a.page-numbers[href]"],
    totalCount: [".Paging .SpanLeft"],
    // سوالات متداول آکاردئونی: { item, question, answer, group? }
    faq: null,
    // پرسش و پاسخ کاربران (microdata استاندارد schema.org)
    question: ["[itemtype$='schema.org/Question']"],
    questionText: ["[itemprop='Text'], [itemprop='text']"],
    answer: ["[itemprop='acceptedAnswer'], [itemprop='suggestedAnswer']"],
  },
  // صفات مجاز در HTML محتوای ذخیره‌شده؛ بقیه (style، class، on* و …) حذف می‌شوند.
  keepAttributes: ["href", "src", "alt", "title", "colspan", "rowspan", "id"],
};

// ---------- CLI ----------

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    config: { type: "string", short: "c" },
    out: { type: "string", short: "o" },
    cache: { type: "string" },
    limit: { type: "string" },
    concurrency: { type: "string" },
    delay: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

if (args.help || positionals.length === 0) {
  console.log(`استفاده:
  node scrape.mjs <sitemap-url> [<sitemap-url> ...] [گزینه‌ها]

گزینه‌ها:
  -c, --config <file>     فایل JSON برای بازنویسی تنظیمات پیش‌فرض (pageTypes، selectors، request، …)
  -o, --out <file>        مسیر فایل خروجی (پیش‌فرض: output/<دامنه>.json)
      --cache <dir>       HTML صفحات را ذخیره و در اجرای بعدی دوباره استفاده می‌کند
      --limit <n>         حداکثر تعداد صفحه از هر نوع (برای تست سریع)
      --concurrency <n>   تعداد درخواست هم‌زمان
      --delay <ms>        مکث بین درخواست‌ها`);
  process.exit(args.help ? 0 : 1);
}

const sitemapUrls = positionals;
const config = mergeDeep(DEFAULT_CONFIG, args.config ? JSON.parse(await fs.readFile(args.config, "utf8")) : {});
if (args.concurrency) config.request.concurrency = Number(args.concurrency);
if (args.delay) config.request.delayMs = Number(args.delay);
const limit = args.limit ? Number(args.limit) : Infinity;
const outFile = args.out ?? path.join("output", `${new URL(sitemapUrls[0]).hostname}.json`);

// ---------- helpers ----------

function mergeDeep(base, override) {
  if (Array.isArray(override) || typeof override !== "object" || override === null) return override ?? base;
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const b = base?.[k];
    out[k] =
      typeof v === "object" && v !== null && !Array.isArray(v) && typeof b === "object" && b !== null && !Array.isArray(b)
        ? mergeDeep(b, v)
        : v;
  }
  return out;
}

const asList = (s) => (s == null ? [] : Array.isArray(s) ? s : [s]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const toLatinDigits = (s) =>
  s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const toNumber = (s) => {
  const m = toLatinDigits(s ?? "").replace(/[,،٬]/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};
const safeDecode = (s) => {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
};

/** نسخه خوانا (decode شده) از آدرس؛ برای مقایسه و ذخیره. */
function normalizeUrl(u, base) {
  if (!u) return null;
  try {
    const url = new URL(u.trim(), base);
    url.hash = "";
    return safeDecode(url.href);
  } catch {
    return null;
  }
}

const slugOf = (url) => safeDecode(new URL(url).pathname).split("/").filter(Boolean).pop() ?? "";

const typeRules = Array.isArray(config.pageTypes)
  ? config.pageTypes.map((r) => ({ re: new RegExp(r.match, "iu"), type: r.type ?? null }))
  : null;

function pageTypeOf(url) {
  const pathname = safeDecode(new URL(url).pathname);
  if (typeRules) return typeRules.find((r) => r.re.test(pathname))?.type ?? null;
  const seg = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  const entry = Object.entries(config.pageTypes).find(([k]) => k.toLowerCase() === seg);
  return entry?.[1] ?? null;
}

const isCategoryType = (type) => type === "category" || type === "auto";

/** اولین selector که نتیجه دارد؛ با $root داخل همان عنصر جستجو می‌کند. */
function pick($root, selectors, $) {
  for (const sel of asList(selectors)) {
    const found = $ ? $(sel) : $root.find(sel);
    if (found.length) return found;
  }
  return null;
}

/** آدرس واقعی تصویر، با در نظر گرفتن lazy-load و placeholderهای data:. */
function imageSrc($img) {
  for (const attr of [...config.lazyImageAttributes, "src"]) {
    const v = $img.attr(attr);
    if (v && !v.startsWith("data:")) return v;
  }
  return null;
}

// ---------- fetch ----------

let lastRequestAt = 0;
let requestChain = Promise.resolve();

/** فاصله بین درخواست‌ها را حتی با چند worker هم‌زمان رعایت می‌کند. */
function throttle() {
  requestChain = requestChain.then(async () => {
    const wait = lastRequestAt + config.request.delayMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  });
  return requestChain;
}

async function fetchText(url) {
  const cacheFile = args.cache && path.join(args.cache, createHash("sha1").update(url).digest("hex") + ".html");
  if (cacheFile) {
    try {
      return { status: 200, body: await fs.readFile(cacheFile, "utf8"), cached: true };
    } catch {}
  }

  let lastError;
  for (let attempt = 1; attempt <= config.request.retries; attempt++) {
    await throttle();
    try {
      const res = await fetch(new URL(url).href, {
        headers: { "User-Agent": config.request.userAgent, "Accept-Language": "fa,en;q=0.8" },
        redirect: "follow",
        signal: AbortSignal.timeout(config.request.timeoutMs),
      });
      const charset = /charset=([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1] ?? "utf-8";
      let decoder;
      try {
        decoder = new TextDecoder(charset);
      } catch {
        decoder = new TextDecoder("utf-8");
      }
      const body = decoder.decode(await res.arrayBuffer());
      if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
      if (res.ok && cacheFile) {
        await fs.mkdir(args.cache, { recursive: true });
        await fs.writeFile(cacheFile, body);
      }
      return { status: res.status, body, finalUrl: safeDecode(res.url) };
    } catch (err) {
      lastError = err;
      await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

// ---------- sitemap ----------

async function readSitemap(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const { status, body } = await fetchText(url);
  if (status !== 200) throw new Error(`sitemap ${url} → HTTP ${status}`);
  const $ = cheerio.load(body, { xml: true });
  const nested = $("sitemapindex > sitemap > loc").map((_, e) => clean($(e).text())).get();
  if (nested.length) {
    const all = [];
    for (const n of nested) all.push(...(await readSitemap(n, seen)));
    return all;
  }
  return $("url").map((_, e) => ({
    url: normalizeUrl(clean($(e).find("loc").text()), url),
    lastmod: clean($(e).find("lastmod").text()) || null,
    priority: toNumber($(e).find("priority").text()),
  })).get().filter((x) => x.url);
}

// ---------- extraction ----------

function parseJsonLd($) {
  const blocks = [];
  $("script[type='application/ld+json']").each((_, e) => {
    try {
      const data = JSON.parse($(e).text());
      for (const item of asList(data)) blocks.push(...(item["@graph"] ?? [item]));
    } catch {}
  });
  return blocks;
}

const ldOfType = (ld, type) => ld.find((b) => asList(b["@type"]).includes(type));

function extractMeta($, pageUrl) {
  const metaContent = (sel) => clean($(sel).first().attr("content")) || null;
  const prefixed = (prefix) => {
    const out = {};
    $(`meta[property^='${prefix}:'], meta[name^='${prefix}:']`).each((_, e) => {
      const key = ($(e).attr("property") ?? $(e).attr("name")).slice(prefix.length + 1);
      out[key] ??= clean($(e).attr("content"));
    });
    return out;
  };
  const keywords = metaContent("meta[name='keywords' i]");
  const canonical = $("link[rel='canonical']").attr("href");
  return {
    title: clean($("title").first().text()) || null,
    description: metaContent("meta[name='description' i]"),
    keywords: keywords ? [...new Set(keywords.split(/[,،]/).map(clean).filter(Boolean))] : [],
    canonical: canonical ? normalizeUrl(canonical, pageUrl) : null,
    robots: metaContent("meta[name='robots' i]"),
    og: prefixed("og"),
    twitter: prefixed("twitter"),
  };
}

function extractBreadcrumbs($, ld, baseUrl) {
  const fromLd = ldOfType(ld, "BreadcrumbList");
  if (fromLd?.itemListElement) {
    return asList(fromLd.itemListElement)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((i) => ({ name: clean(i.name ?? i.item?.name), url: normalizeUrl(i.item?.["@id"] ?? i.item ?? "", baseUrl) }));
  }
  const links = pick(null, config.selectors.breadcrumb, $);
  return links ? links.map((_, a) => ({ name: clean($(a).text()), url: normalizeUrl($(a).attr("href"), baseUrl) })).get() : [];
}

function extractRating($, ld) {
  const agg = ldOfType(ld, "Product")?.aggregateRating ?? ld.find((b) => b.aggregateRating)?.aggregateRating;
  if (agg) {
    return {
      value: toNumber(String(agg.ratingValue)),
      best: toNumber(String(agg.bestRating ?? "")),
      count: toNumber(String(agg.ratingCount ?? agg.reviewCount ?? "")),
    };
  }
  const value = pick(null, config.selectors.ratingValue, $);
  const count = pick(null, config.selectors.ratingCount, $);
  return value ? { value: toNumber(value.first().text()), best: null, count: count ? toNumber(count.first().text()) : null } : null;
}

function extractTable($, table) {
  const rows = $(table).find("tr").map((_, tr) => [$(tr).find("th, td").map((_, c) => clean($(c).text())).get()]).get();
  const hasHeader = $(table).find("tr").first().find("th").length > 0 || $(table).find("thead").length > 0;
  return hasHeader ? { headers: rows[0] ?? [], rows: rows.slice(1) } : { headers: [], rows };
}

/** جفت‌های «عنوان: مقدار» از منابع تعریف‌شده در config؛ با $root فقط داخل همان عنصر. */
function extractSpecs($, sources, $root = null) {
  const specs = [];
  for (const src of asList(sources)) {
    const items = $root ? $root.find(src.item) : $(src.item);
    items.each((_, el) => {
      const $el = $(el);
      const label = clean($el.find(src.label).first().text()).replace(/[:：]$/, "").trim();
      const value = clean($el.find(src.value).first().text());
      if (!label || !value) return;
      let group = src.groupName ?? null;
      if (!group && src.group) {
        // تیتر گروه معمولاً قبل از لیست (یا قبل از والد لیست) آمده است
        const title = $el.parent().prevAll(src.group).first();
        group = clean((title.length ? title : $el.parent().parent().prevAll(src.group).first()).text()) || null;
      }
      specs.push({ group, label, value });
    });
  }
  return specs;
}

function extractPricing($) {
  const p = config.selectors.pricing;
  if (!p) return null;
  const $box = $(p.container).first();
  if (!$box.length) return null;
  const fields = $box.find(p.fieldItem).map((_, el) => {
    const label = clean($(el).find(p.fieldLabel).first().text()).replace(/[:：]$/, "").trim();
    const value = clean($(el).find(p.fieldValue).last().text());
    return { label, value, amount: toNumber(value) };
  }).get().filter((f) => f.label && f.value);
  const table = p.installmentsTable ? $box.find(p.installmentsTable).first() : null;
  const installments = table?.length
    ? extractTable($, table).rows.map((cells) => ({
        term: cells[0] ?? null,
        months: toNumber(cells[0]),
        amount: toNumber(cells[1]),
        value: cells[1] ?? null,
      }))
    : [];
  if (!fields.length && !installments.length) return null;
  return { title: clean($box.find(p.title).first().text()) || null, fields, installments };
}

function extractContent($, baseUrl) {
  let matches = null;
  for (const sel of config.selectors.content) {
    const els = $(sel).filter((_, e) => clean($(e).text()) !== "");
    if (els.length) {
      matches = els;
      break;
    }
  }
  if (!matches) return null;

  // عناصری که داخل عنصر منطبق دیگری هستند تکراری‌اند
  const all = matches.toArray();
  const roots = all.filter((e) => !$(e).parents().toArray().some((p) => all.includes(p)));
  const $content = $("<div></div>");
  for (const e of roots) $content.append($(e).clone());

  $content.find("img").each((_, e) => {
    const src = imageSrc($(e));
    if (src) $(e).attr("src", src);
    else $(e).remove();
  });
  $content.find(config.selectors.removeFromContent.join(",")).remove();
  for (const sel of config.selectors.promoteToHeading) {
    $content.find(sel).each((_, e) => void $(e).replaceWith(`<h2>${$(e).html()}</h2>`));
  }
  $content.find("i:empty").remove();
  $content.find("[src]").each((_, e) => void $(e).attr("src", normalizeUrl($(e).attr("src"), baseUrl)));
  $content.find("[href]").each((_, e) => {
    const href = $(e).attr("href");
    if (!/^(mailto|tel|javascript|whatsapp):/i.test(href)) $(e).attr("href", normalizeUrl(href, baseUrl));
  });
  $content.find("*").each((_, e) => {
    for (const attr of Object.keys(e.attribs ?? {})) {
      if (!config.keepAttributes.includes(attr)) $(e).removeAttr(attr);
    }
  });

  const headings = $content.find("h2, h3, h4, h5, h6").map((_, h) => ({
    level: Number(h.tagName[1]),
    text: clean($(h).text()),
  })).get().filter((h) => h.text);

  // متن هر بخش = متن عناصر بعد از تیتر تا تیتر بعدی
  const sections = $content.find("h2, h3, h4").map((_, h) => ({
    heading: clean($(h).text()),
    level: Number(h.tagName[1]),
    text: clean($(h).nextUntil("h1, h2, h3, h4").map((_, s) => $(s).text()).get().join(" ")),
  })).get().filter((s) => s.heading);

  return {
    html: $content.html().replace(/\n\s*\n+/g, "\n").trim(),
    text: clean($content.text()),
    headings,
    sections,
    images: $content.find("img").map((_, i) => ({ src: $(i).attr("src"), alt: clean($(i).attr("alt")) || null })).get(),
    tables: $content.find("table").map((_, t) => [extractTable($, t)]).get(),
    links: $content.find("a[href]").map((_, a) => ({ text: clean($(a).text()), href: $(a).attr("href") })).get()
      .filter((l) => l.href && l.text),
  };
}

function extractImages($, ld, baseUrl) {
  const urls = [];
  const add = (u, alt = null) => {
    const abs = u && !u.startsWith("data:") ? normalizeUrl(u, baseUrl) : null;
    if (abs && !urls.some((x) => x.src === abs)) urls.push({ src: abs, alt });
  };
  const main = pick(null, config.selectors.mainImage, $);
  if (main) add(imageSrc(main.first()), clean(main.first().attr("alt")) || null);
  const gallery = pick(null, config.selectors.gallery, $);
  gallery?.each((_, a) => {
    const img = $(a).find("img").first();
    add($(a).attr("href"), clean($(a).attr("title")) || clean(img.attr("alt")) || null);
  });
  for (const img of asList(ldOfType(ld, "Product")?.image)) add(typeof img === "string" ? img : img.url);
  add($("meta[property='og:image']").attr("content"));
  return urls;
}

/** پرسش‌وپاسخ‌ها: FAQPage در JSON-LD، آکاردئون FAQ و نظرات کاربران با microdata (بدون نام افراد). */
function extractQuestions($, ld) {
  const faqLd = asList(ldOfType(ld, "FAQPage")?.mainEntity).map((q) => ({
    question: clean(q.name),
    answers: [clean(cheerio.load(q.acceptedAnswer?.text ?? "").text())].filter(Boolean),
    group: null,
    source: "faq",
  }));

  const f = config.selectors.faq;
  const faqHtml = f
    ? $(f.item).map((_, el) => {
        const $el = $(el);
        let group = null;
        if (f.group) {
          // گروه: تب والد که id آن به لینک تب اشاره دارد
          const tabId = $el.closest("[id]").attr("id");
          group = tabId ? clean($(`${f.group}[href='#${tabId}']`).first().text()) || null : null;
        }
        return {
          question: clean($el.find(f.question).first().text()),
          answers: [clean($el.find(f.answer).first().text())].filter(Boolean),
          group,
          source: "faq",
        };
      }).get().filter((q) => q.question)
    : [];

  const questions = pick(null, config.selectors.question, $);
  const comments = questions
    ? questions.map((_, q) => {
        const $q = $(q);
        const answers = $q.find(config.selectors.answer.join(","));
        const answerEls = answers.toArray();
        // متن خود سؤال: اولین فیلد متن که داخل پاسخ نباشد
        const text = $q
          .find(config.selectors.questionText.join(","))
          .filter((_, t) => !$(t).parents().toArray().some((p) => answerEls.includes(p)))
          .first();
        return {
          question: clean(text.text()),
          answers: answers.map((_, a) => clean($(a).find(config.selectors.questionText.join(",")).first().text())).get().filter(Boolean),
          group: null,
          source: "comment",
        };
      }).get().filter((q) => q.question)
    : [];
  return [...faqLd, ...faqHtml, ...comments];
}

function extractListing($, baseUrl) {
  const items = pick(null, config.selectors.listItem, $);
  if (!items) return [];
  return items.map((_, el) => {
    const $el = $(el);
    const link = pick($el, config.selectors.listItemLink);
    const title = pick($el, config.selectors.listItemTitle);
    const summary = pick($el, config.selectors.listItemSummary);
    const img = pick($el, config.selectors.listItemImage);
    const price = pick($el, config.selectors.listItemPrice);
    const url = link ? normalizeUrl(link.first().attr("href"), baseUrl) : null;
    const priceText = clean(price?.first().text()) || null;
    const specs = extractSpecs($, config.selectors.listItemSpecs, $el).map(({ label, value }) => ({ label, value }));
    return {
      title: clean(title?.first().text()) || clean(link?.first().text()) || null,
      url,
      slug: url ? slugOf(url) : null,
      summary: clean(summary?.first().text()) || null,
      image: img ? normalizeUrl(imageSrc(img.first()), baseUrl) : null,
      ...(price ? { price: priceText, priceAmount: toNumber(priceText) } : {}),
      ...(specs.length ? { specs } : {}),
    };
  }).get().filter((i) => i.url);
}

function extractCommon($, url) {
  const baseHref = $("base[href]").attr("href");
  const baseUrl = baseHref ? new URL(baseHref, new URL(url).href).href : new URL(url).href;
  const ld = parseJsonLd($);
  const h1 = pick(null, config.selectors.title, $);
  return {
    baseUrl,
    ld,
    page: {
      url,
      slug: slugOf(url),
      title: clean(h1?.first().text()) || null,
      meta: extractMeta($, url),
      breadcrumbs: extractBreadcrumbs($, ld, baseUrl),
      rating: extractRating($, ld),
      content: extractContent($, baseUrl),
      questions: extractQuestions($, ld),
      jsonLd: ld,
    },
  };
}

function extractProduct($, url) {
  const { baseUrl, ld, page } = extractCommon($, url);
  const product = ldOfType(ld, "Product") ?? {};
  const offer = asList(product.offers)[0] ?? {};
  const categories = [];
  const addCategory = (name, catUrl) => {
    if (!catUrl || catUrl === url || categories.some((c) => c.url === catUrl)) return;
    const slug = slugOf(catUrl);
    if (!config.ignoreCategorySlugs.includes(slug)) categories.push({ name, url: catUrl, slug });
  };
  // دسته‌بندی‌های مسیر راهنما (بدون صفحه اصلی و خود محصول)
  for (const b of page.breadcrumbs) if (b.url && isCategoryType(pageTypeOf(b.url))) addCategory(b.name, b.url);
  pick(null, config.selectors.productCategories, $)?.each((_, a) =>
    addCategory(clean($(a).text()), normalizeUrl($(a).attr("href"), baseUrl)),
  );
  return {
    type: "product",
    ...page,
    name: clean(product.name) || page.title,
    sku: (product.sku ?? product.mpn) != null ? String(product.sku ?? product.mpn) : null,
    description: clean(product.description) || page.meta.description,
    brand: typeof product.brand === "string" ? product.brand : product.brand?.name ?? null,
    offer: offer.price !== undefined || offer.availability
      ? {
          price: toNumber(String(offer.price ?? "")),
          currency: offer.priceCurrency ?? null,
          availability: offer.availability?.split("/").pop() ?? null,
          priceValidUntil: offer.priceValidUntil ?? null,
        }
      : null,
    pricing: extractPricing($),
    specs: extractSpecs($, config.selectors.specs),
    images: extractImages($, ld, baseUrl),
    categories,
  };
}

function extractCategory($, url) {
  const { baseUrl, page } = extractCommon($, url);
  const total = pick(null, config.selectors.totalCount, $);
  const pagination = pick(null, config.selectors.pagination, $);
  return {
    type: "category",
    ...page,
    totalCount: total ? toNumber(total.first().text()) : null,
    items: extractListing($, baseUrl),
    paginationUrls: pagination
      ? [...new Set(pagination.map((_, a) => normalizeUrl($(a).attr("href"), baseUrl)).get())].filter((u) => u && u !== url)
      : [],
  };
}

// ---------- crawl ----------

async function scrapePage(url, type) {
  const { status, body, finalUrl, cached } = await fetchText(url);
  if (status !== 200) throw new Error(`HTTP ${status}`);
  const $ = cheerio.load(body);
  let data;
  if (type === "product") data = extractProduct($, url);
  else if (type === "page") data = { type: "page", ...extractCommon($, url).page };
  else data = extractCategory($, url);
  if (finalUrl && finalUrl !== url) data.redirectedTo = finalUrl;
  console.log(`${cached ? "[cache]" : "[ok]   "} ${type.padEnd(8)} ${url}`);
  return data;
}

async function scrapeCategory(url, type) {
  const category = await scrapePage(url, type);
  const visited = new Set([url]);
  const queue = [...category.paginationUrls];
  while (queue.length && visited.size < config.maxCategoryPages) {
    const next = queue.shift();
    if (visited.has(next) || !isCategoryType(pageTypeOf(next))) continue;
    visited.add(next);
    const page = await scrapePage(next, "category");
    category.items.push(...page.items);
    queue.push(...page.paginationUrls.filter((u) => !visited.has(u)));
  }
  const seen = new Set();
  category.items = category.items.filter((i) => !seen.has(i.url) && seen.add(i.url));
  category.pages = [...visited];
  delete category.paginationUrls;

  // auto: صفحه بدون لیست محصول یک صفحه عمومی است
  if (type === "auto" && category.items.length === 0) {
    const page = { ...category, type: "page" };
    delete page.items;
    delete page.totalCount;
    delete page.pages;
    return page;
  }
  return category;
}

async function runPool(tasks, worker) {
  const results = [];
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, config.request.concurrency) }, async () => {
      while (index < tasks.length) {
        const task = tasks[index++];
        results.push(await worker(task));
      }
    }),
  );
  return results;
}

async function main() {
  const entries = [];
  for (const sitemapUrl of sitemapUrls) {
    console.log(`خواندن sitemap: ${sitemapUrl}`);
    entries.push(...(await readSitemap(sitemapUrl)));
  }
  const byType = { product: [], listing: [], page: [] };
  const seenUrls = new Set();
  for (const e of entries) {
    const type = pageTypeOf(e.url);
    if (!type || seenUrls.has(e.url)) continue;
    seenUrls.add(e.url);
    if (type === "product") byType.product.push(e);
    else if (type === "page") byType.page.push({ ...e, type });
    else if (isCategoryType(type)) byType.listing.push({ ...e, type });
  }
  for (const k of Object.keys(byType)) byType[k] = byType[k].slice(0, limit);
  console.log(
    `در sitemap: ${entries.length} آدرس، ${byType.listing.length} دسته‌بندی/خودکار، ${byType.page.length} صفحه، ${byType.product.length} محصول\n`,
  );

  const errors = [];
  const lastmodOf = new Map(entries.map((e) => [e.url, e.lastmod]));
  const safely = (fn) => async (task) => {
    const url = typeof task === "string" ? task : task.url;
    try {
      const data = await fn(task);
      data.lastmod = lastmodOf.get(url) ?? null;
      return data;
    } catch (err) {
      console.warn(`[خطا]  ${url} → ${err.message}`);
      errors.push({ url, error: err.message });
      return null;
    }
  };

  const listingResults = (await runPool(byType.listing, safely((e) => scrapeCategory(e.url, e.type)))).filter(Boolean);
  const pageResults = (await runPool(byType.page, safely((e) => scrapePage(e.url, "page")))).filter(Boolean);
  const categories = listingResults.filter((x) => x.type === "category");
  const pages = [...listingResults.filter((x) => x.type === "page"), ...pageResults];

  const productUrls = new Set(byType.product.map((e) => e.url));
  const extraProducts = new Set();
  if (config.followListedProducts && limit === Infinity) {
    for (const c of categories) {
      for (const item of c.items) {
        if (pageTypeOf(item.url) === "product" && !productUrls.has(item.url)) {
          productUrls.add(item.url);
          extraProducts.add(item.url);
        }
      }
    }
    if (extraProducts.size) console.log(`\n${extraProducts.size} محصول از لیست دسته‌بندی‌ها پیدا شد که در sitemap نبود\n`);
  }

  // آدرس محصولی که به صفحه‌ای غیر از محصول (یا محصول تکراری) ریدایرکت شده، محصول جدا حساب نمی‌شود
  const redirects = [];
  const products = [];
  for (const p of (await runPool([...productUrls], safely((u) => scrapePage(u, "product")))).filter(Boolean)) {
    const target = p.redirectedTo;
    if (target && (pageTypeOf(target) !== "product" || productUrls.has(target))) redirects.push({ url: p.url, to: target });
    else products.push(p);
  }
  const productByUrl = new Map(products.map((p) => [p.url, p]));
  for (const p of products) p.foundVia = extraProducts.has(p.url) ? "category-listing" : "sitemap";

  // اتصال محصول ↔ دسته‌بندی: هر محصول همه دسته‌بندی‌هایی را که در لیستشان آمده هم می‌گیرد
  for (const c of categories) {
    c.productSlugs = c.items.map((i) => i.slug);
    for (const item of c.items) {
      const p = productByUrl.get(item.url);
      if (p && !p.categories.some((pc) => pc.url === c.url)) p.categories.push({ name: c.title, url: c.url, slug: c.slug });
    }
  }

  const sortByUrl = (a, b) => a.url.localeCompare(b.url, "fa");
  const result = {
    source: { sitemaps: sitemapUrls, site: new URL(sitemapUrls[0]).origin },
    scrapedAt: new Date().toISOString(),
    stats: {
      categories: categories.length,
      products: products.length,
      pages: pages.length,
      redirects: redirects.length,
      errors: errors.length,
    },
    categories: categories.sort(sortByUrl),
    products: products.sort(sortByUrl),
    pages: pages.sort(sortByUrl),
    redirects: redirects.sort(sortByUrl),
    errors,
  };

  await fs.mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(result, null, 2));
  console.log(`\nذخیره شد: ${path.resolve(outFile)}`);
  console.log(
    `دسته‌بندی: ${categories.length} | محصول: ${products.length} | صفحه: ${pages.length} | ریدایرکت: ${redirects.length} | خطا: ${errors.length}`,
  );
}

await main();
