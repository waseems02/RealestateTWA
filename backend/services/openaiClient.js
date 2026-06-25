const OpenAI = require("openai");

let cachedClient = null;
let warned = false;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    if (!warned) {
      console.warn("OPENAI_API_KEY is missing. AI chat will run in mock mode.");
      warned = true;
    }
    return null;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

module.exports = { getOpenAIClient };
