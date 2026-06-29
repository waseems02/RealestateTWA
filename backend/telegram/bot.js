const { Bot } = require("grammy");
const { aiSearch } = require("../services/aiSearchService");
const { formatSearchResultsHtml } = require("./formatListing");

const WELCOME = `ברוכים הבאים ל-<b>RoomieFit</b> 🏠

אני עוזר חיפוש דירות לסטודנטים בישראל. אפשר לכתוב לי במילים שלך מה אתם מחפשים — בעברית או באנגלית — ואני אמצא דירות מתאימות.

לדוגמה:
• <code>דירה בתל אביב עד 4500 שח עם מרפסת</code>
• <code>room in Jerusalem near Hebrew University</code>
• <code>חדר בחיפה לסטודנטים</code>

פקודות:
/search &lt;תיאור&gt; — חיפוש מובנה
/help — עזרה`;

const HELP = `<b>איך להשתמש</b>

פשוט כתבו לי מה אתם מחפשים. אני אבין:
• עיר (תל אביב, ירושלים, חיפה, באר שבע ועוד)
• תקציב (למשל "עד 4000 ₪")
• מספר חדרים, גודל במ"ר
• דרישות: מרפסת, חניה, מרוהט, מזגן
• קמפוס/אוניברסיטה קרובים
• העדפות שותפים (סטודנטים, דתיים/חילונים, מין)

לדוגמה:
<code>דירת 3 חדרים בתל אביב עד 5000 קרוב לאוניברסיטת תל אביב</code>`;

async function handleSearchText(ctx, query) {
  if (!query) {
    await ctx.reply("נא לכתוב מה אתם מחפשים. דוגמה: <code>דירה בתל אביב עד 4500 עם מרפסת</code>", {
      parse_mode: "HTML",
    });
    return;
  }

  await ctx.replyWithChatAction("typing").catch(() => {});

  try {
    const result = await aiSearch(query);
    const html = formatSearchResultsHtml(result);
    await ctx.reply(html, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.warn(`Telegram search failed: ${err.message}`);
    await ctx.reply("מצטערים, חיפוש נכשל. אפשר לנסות שוב בעוד רגע.");
  }
}

function createTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is missing. Telegram bot will run in mock mode.");
    return null;
  }

  const bot = new Bot(token);

  bot.command("start", (ctx) => ctx.reply(WELCOME, { parse_mode: "HTML" }));
  bot.command("help", (ctx) => ctx.reply(HELP, { parse_mode: "HTML" }));

  bot.command("search", async (ctx) => {
    const query = (ctx.match || "").toString().trim();
    await handleSearchText(ctx, query);
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text || "";
    if (text.startsWith("/")) return; // unknown command — let grammy ignore
    await handleSearchText(ctx, text.trim());
  });

  bot.catch((err) => {
    console.warn(`Telegram bot error: ${err.error?.message || err.message}`);
  });

  return bot;
}

module.exports = { createTelegramBot };
