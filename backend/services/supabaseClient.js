const { createClient } = require("@supabase/supabase-js");

let cachedAnonClient = null;
let cachedServiceClient = null;
let warnedMissingReadVars = false;
let warnedMissingServiceVars = false;

const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
};

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (!warnedMissingReadVars) {
      console.warn(
        "SUPABASE_URL or SUPABASE_ANON_KEY is missing. Read APIs will run in mock mode."
      );
      warnedMissingReadVars = true;
    }
    return null;
  }

  if (!cachedAnonClient) {
    cachedAnonClient = createClient(url, anonKey, clientOptions);
  }

  return cachedAnonClient;
}

function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    if (!warnedMissingServiceVars) {
      console.warn(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Backend admin operations will run in mock mode."
      );
      warnedMissingServiceVars = true;
    }
    return null;
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createClient(url, serviceRoleKey, clientOptions);
  }

  return cachedServiceClient;
}

module.exports = { getSupabaseClient, getSupabaseServiceClient };
