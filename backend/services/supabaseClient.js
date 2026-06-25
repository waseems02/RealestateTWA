const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;
let warned = false;

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    if (!warned) {
      console.warn(
        "Supabase environment variables are missing. Listings will run in mock mode."
      );
      warned = true;
    }
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return cachedClient;
}

module.exports = { getSupabaseClient };
