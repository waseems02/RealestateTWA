// Shared auth bridge for RoomieFit.
//
// Loads @supabase/supabase-js from CDN, initialises a singleton client with
// the anon key (served from /api/config.js), and exposes a small RfAuth API
// the rest of the app uses. Auth state is persisted by supabase-js itself
// in localStorage; we only mirror it for UI convenience.
//
//   window.RfAuth.signUp(email, password, fullName)
//   window.RfAuth.signIn(email, password)
//   window.RfAuth.signOut()
//   window.RfAuth.getUser()        // sync, returns the cached user or null
//   window.RfAuth.getSession()     // sync, returns the cached session
//   window.RfAuth.getAccessToken() // sync, returns the bearer token or null
//   window.RfAuth.onChange(fn)     // subscribe to login/logout events
//   window.RfAuth.ready            // Promise that resolves once init finishes
//
// Listeners receive { event, user } where event is one of:
//   'INIT' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED'
//
// Markup hook: any element with `data-auth-area="logged-in"` or
// `data-auth-area="logged-out"` is shown/hidden automatically based on
// state. `[data-auth-display="name"]` / `[data-auth-display="email"]`
// receive the user's name / email when logged in.

(function () {
  if (window.RfAuth) return;

  const SUPABASE_JS_URL =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";

  let client = null;
  let currentSession = null;
  let currentUser = null;
  const listeners = new Set();

  const ready = (async () => {
    // 1. Load the Supabase JS UMD bundle (creates window.supabase global).
    await loadScript(SUPABASE_JS_URL);

    // 2. Pull our anon-key config from the backend.
    const cfg = window.RoomieFitConfig;
    if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
      console.warn(
        "RfAuth: missing window.RoomieFitConfig. Include <script src=\"/api/config.js\"></script> BEFORE auth.js."
      );
      return;
    }

    client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data } = await client.auth.getSession();
    currentSession = data?.session || null;
    currentUser = currentSession?.user || null;

    client.auth.onAuthStateChange((event, session) => {
      currentSession = session || null;
      currentUser = session?.user || null;
      applyAuthUiState();
      listeners.forEach((fn) => {
        try {
          fn({ event, user: currentUser, session: currentSession });
        } catch (e) {
          console.warn("RfAuth listener threw:", e);
        }
      });
    });

    applyAuthUiState();
    listeners.forEach((fn) => fn({ event: "INIT", user: currentUser, session: currentSession }));
  })();

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  function applyAuthUiState() {
    const loggedIn = !!currentUser;
    document.querySelectorAll('[data-auth-area="logged-in"]').forEach((el) => {
      el.style.display = loggedIn ? "" : "none";
    });
    document.querySelectorAll('[data-auth-area="logged-out"]').forEach((el) => {
      el.style.display = loggedIn ? "none" : "";
    });
    if (loggedIn) {
      const name =
        currentUser.user_metadata?.full_name ||
        currentUser.email?.split("@")[0] ||
        "סטודנט";
      document.querySelectorAll('[data-auth-display="name"]').forEach((el) => {
        el.textContent = name;
      });
      document.querySelectorAll('[data-auth-display="email"]').forEach((el) => {
        el.textContent = currentUser.email || "";
      });
      document.querySelectorAll('[data-auth-display="initial"]').forEach((el) => {
        el.textContent = (name[0] || "?").toUpperCase();
      });
    }
  }

  // Run again after the DOM is parsed so server-rendered hidden elements
  // get their state set even if auth init hadn't completed yet.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAuthUiState);
  } else {
    applyAuthUiState();
  }

  async function ensureClient() {
    await ready;
    if (!client) throw new Error("Supabase client is not configured.");
    return client;
  }

  async function signUp(email, password, fullName) {
    const sb = await ensureClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    // Bootstrap the profile row so RLS-protected actions (insert listing,
    // favourites, etc.) work immediately. Supabase auth.users → profiles is
    // a FK relationship and our 0004 RLS policy accepts an insert where
    // (id = auth.uid() and role = 'student').
    if (data.user && data.session) {
      const { error: pErr } = await sb.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: fullName || email.split("@")[0],
          email,
          role: "student",
          preferred_language: "he",
        },
        { onConflict: "id" }
      );
      if (pErr) console.warn("profile bootstrap failed:", pErr.message);
    }
    return data;
  }

  async function signIn(email, password) {
    const sb = await ensureClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const sb = await ensureClient();
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  }

  window.RfAuth = {
    ready,
    signUp,
    signIn,
    signOut,
    getUser: () => currentUser,
    getSession: () => currentSession,
    getAccessToken: () => currentSession?.access_token || null,
    getClient: async () => await ensureClient(),
    onChange: (fn) => {
      listeners.add(fn);
      if (currentUser !== null || currentSession !== null) {
        fn({ event: "INIT", user: currentUser, session: currentSession });
      }
      return () => listeners.delete(fn);
    },
  };
})();
