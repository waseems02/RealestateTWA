import { createClient } from "@supabase/supabase-js";
import type { Database } from "./db-types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy frontend/.env.example to frontend/.env.local and fill in real values."
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: false },
});
