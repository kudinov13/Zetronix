import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import templatesRoutes from "./routes/templates.js";
import casesRoutes from "./routes/cases.js";
import certificatesRoutes from "./routes/certificates.js";
import leadsRoutes from "./routes/leads.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много запросов, попробуйте позже" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много попыток входа, попробуйте через 15 минут" },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/setup", authLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/chat", chatRoutes);

// Serve extracted template files
const TEMPLATES_DIR = path.resolve(process.cwd(), "public", "templates");
if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
app.use("/templates", express.static(TEMPLATES_DIR, { fallthrough: true }));

// Serve other static files from public (previews, media, etc.)
app.use("/media", express.static(path.resolve(process.cwd(), "public", "media")));

// SEO: robots.txt and sitemap.xml
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://zetronix.ru/sitemap.xml\n");
});
app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://zetronix.ru/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://zetronix.ru/cases</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://zetronix.ru/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>`);
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Production: serve built frontend from dist
const DIST_DIR = path.resolve(process.cwd(), "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, {
    maxAge: "1y",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }));
  // SPA fallback: serve index.html for non-API, non-file routes
  app.get("{*path}", (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
