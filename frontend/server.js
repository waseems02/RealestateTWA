// RoomieFit frontend static server.
//
// This service serves the plain HTML/JS/CSS site AND proxies all /api/*
// requests to the backend service so the browser code can keep using
// relative URLs like fetch('/api/listings') exactly as it did when the
// backend was serving everything.
//
// Environment variables:
//   BACKEND_URL  — required in production. Public URL of the backend
//                  service (e.g. https://roomiefit-backend.up.railway.app).
//                  Falls back to http://localhost:4000 in dev.
//   PORT         — auto-injected by Railway.

const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

console.log(`RoomieFit frontend: proxying /api/* → ${BACKEND_URL}`);

// Forward every /api/* request through to the backend. http-proxy-middleware
// v3 strips the mount path, so we rewrite it back — the backend routes are
// under /api/health, /api/listings etc. and rely on the prefix.
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    xfwd: true,
    logLevel: "warn",
    pathRewrite: (path) => `/api${path}`,
  })
);

// Static files (index.html, listings.html, js/, assets/, etc.).
app.use(express.static(__dirname, { extensions: ["html"] }));

// SPA-style fallback: unknown paths render the home page. Keeps
// deep links like /listings.html working plus arbitrary 404s.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`RoomieFit frontend running on port ${PORT}`);
});
