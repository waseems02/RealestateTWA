const { Bot } = require("grammy");
const { listListings } = require("../services/listingsService");
const { getSupabaseServiceClient } = require("../services/supabaseClient");

const START_TEXT = `שלום! אני הבוט של RoomieFit
אני יכול לעזור לך למצוא דירות וחדרים לסטודנטים ליד אוניברסיטאות ומכללות בישראל.

אפשר לכתוב:
חפש דירות בירושלים
חפש חדר בתל אביב עד 3500
דירות ליד האוניברסיטה העברית
עזרה`;

const HELP_TEXT = `פקודות אפשריות:
- חפש דירות בירושלים
- חפש חדר בתל אביב עד 3500
- דירות בחיפה
- דירה ליד בר אילן
- הצג דירות זולות
- עזרה`;

const CITY_ALIASES = [
  ["ירושלים", "Jerusalem"],
  ["תל אביב", "Tel Aviv"],
  ["חיפה", "Haifa"],
  ["באר שבע", "Be'er Sheva"],
  ["רמת גן", "Ramat Gan"],
  ["אריאל", "Ariel"],
  ["רחובות", "Rehovot"],
  ["הרצליה", "Herzliya"],
  ["חולון", "Holon"],
  ["נתניה", "Netanya"]
];

const UNIVERSITY_KEYWORDS = [
  ["האוניברסיטה העברית", "Jerusalem"],
  ["תל אביב", "Tel Aviv"],
  ["חיפה", "Haifa"],
  ["בן גוריון", "Be'er Sheva"],
  ["בר אילן", "Ramat Gan"],
  ["אריאל", "Ariel"],
  ["רייכמן", "Herzliya"]
];

let cachedBot = null;

function getPublicAppUrl() {
  return (process.env.PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function parseSearchMessage(text = "") {
  const filters = { limit: 5 };
  const normalized = text.replace(/\s+/g, " ").trim();
  const priceMatch = normalized.match(/\d{3,6}/);

  for (const [hebrew, city] of CITY_ALIASES) {
    if (normalized.includes(hebrew)) {
      filters.city = city;
      break;
    }
  }

  for (const [keyword, city] of UNIVERSITY_KEYWORDS) {
    if (normalized.includes(keyword)) {
      filters.city = filters.city || city;
      break;
    }
  }

  if (normalized.includes("חדר")) filters.listingType = "room";
  if (normalized.includes("דירה") || normalized.includes("דירות")) filters.listingType = filters.listingType || "apartment";
  if (normalized.includes("זול") || normalized.includes("זולות")) filters.maxPrice = 3000;
  if (priceMatch) filters.maxPrice = Number(priceMatch[0]);

  return filters;
}

function listingTypeHebrew(type) {
  return type === "room" ? "חדר" : "דירה";
}

function formatNumber(value, fallback = "לא צוין") {
  if (value === null || value === undefined || value === "") return fallback;
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString("he-IL") : String(value);
}

function formatListing(listing) {
  const url = `${getPublicAppUrl()}/listing-details.html?id=${encodeURIComponent(listing.id)}`;
  return `${listing.title}
${listing.city || "לא צוינה"}, ${listing.neighborhood || "לא צוינה"}
${formatNumber(listing.price)} ₪
סוג: ${listingTypeHebrew(listing.listing_type)}
גודל: ${formatNumber(listing.size_sqm)} מ"ר
תחנת אוטובוס: ${listing.nearest_bus_station || "לא צוינה"}, ${formatNumber(listing.distance_to_bus_station_m)} מטר
רכבת / רכבת קלה: ${listing.nearest_train_station || "לא צוינה"}, ${formatNumber(listing.distance_to_train_station_km)} ק"מ
מרחק מהקמפוס: ${formatNumber(listing.distance_to_campus_km)} ק"מ
קישור באתר: ${url}`;
}

async function ensureTelegramUser(ctx) {
  const supabase = getSupabaseServiceClient();
  const from = ctx.from;
  const chat = ctx.chat;

  if (!supabase || !from || !chat) return null;

  const row = {
    telegram_user_id: String(from.id),
    telegram_username: from.username || null,
    chat_id: String(chat.id)
  };

  const { data, error } = await supabase.from("telegram_users").upsert(row, { onConflict: "telegram_user_id" }).select("id").single();

  if (error) {
    console.warn(`Telegram user logging failed: ${error.message}`);
    return null;
  }

  return data?.id || null;
}

async function logTelegramMessage(telegramUserRowId, direction, messageText) {
  if (!telegramUserRowId || !messageText) return;
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;

  const { error } = await supabase.from("telegram_messages").insert({
    telegram_user_id: telegramUserRowId,
    direction,
    message_text: messageText
  });

  if (error) {
    console.warn(`Telegram message logging failed: ${error.message}`);
  }
}

async function replyAndLog(ctx, telegramUserRowId, text) {
  await ctx.reply(text, { disable_web_page_preview: true });
  await logTelegramMessage(telegramUserRowId, "outgoing", text);
}

function createTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is missing. Telegram bot will run in mock mode.");
    return null;
  }

  if (cachedBot) return cachedBot;

  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    const telegramUserRowId = await ensureTelegramUser(ctx);
    ctx.state.telegramUserRowId = telegramUserRowId;

    if (ctx.message?.text) {
      await logTelegramMessage(telegramUserRowId, "incoming", ctx.message.text);
    }

    await next();
  });

  bot.command("start", async (ctx) => {
    await replyAndLog(ctx, ctx.state.telegramUserRowId, START_TEXT);
  });

  bot.command("help", async (ctx) => {
    await replyAndLog(ctx, ctx.state.telegramUserRowId, HELP_TEXT);
  });

  bot.hears(/^עזרה$/i, async (ctx) => {
    await replyAndLog(ctx, ctx.state.telegramUserRowId, HELP_TEXT);
  });

  bot.on("message:text", async (ctx) => {
    const filters = parseSearchMessage(ctx.message.text);
    const result = await listListings(filters);
    const listings = result.listings.slice(0, 5);

    if (!listings.length) {
      await replyAndLog(ctx, ctx.state.telegramUserRowId, "לא מצאתי דירות מתאימות כרגע. נסה לשנות עיר, מחיר או סוג נכס.");
      return;
    }

    await replyAndLog(ctx, ctx.state.telegramUserRowId, listings.map(formatListing).join("\n\n---\n\n"));
  });

  cachedBot = bot;
  return bot;
}

async function handleTelegramUpdate(update) {
  const bot = createTelegramBot();
  if (!bot) {
    return { enabled: false, mode: "mock", ok: true };
  }

  await bot.handleUpdate(update);
  return { enabled: true, mode: "webhook", ok: true };
}

function getTelegramStatus() {
  const hasToken = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  return {
    enabled: hasToken,
    mode: "webhook",
    hasToken
  };
}

module.exports = {
  createTelegramBot,
  getTelegramStatus,
  handleTelegramUpdate,
  parseSearchMessage
};
