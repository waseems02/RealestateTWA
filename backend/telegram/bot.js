const { Bot } = require("grammy");

function createTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is missing. Telegram bot will run in mock mode.");
    return null;
  }

  const bot = new Bot(token);

  bot.command("start", (ctx) =>
    ctx.reply("ברוכים הבאים ל-RoomieFit. אפשר לקבל עדכוני דירות וחיפוש שותפים.")
  );

  return bot;
}

module.exports = { createTelegramBot };
