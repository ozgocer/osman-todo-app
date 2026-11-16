require("dotenv").config();

const cors = require("cors");
const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3000;
const frontendRoot = path.resolve(__dirname, "..");

app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.path} origin=${req.get("origin") || "(none)"}`,
  );
  next();
});

app.use(
  cors({
    origin: [
      "https://expert-space-meme-rvgjwrrx9rqcx4vp-8000.app.github.dev",
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      /^https:\/\/[a-z0-9-]+\.app\.github\.dev$/i,
    ],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());

app.post("/api/plan", (req, res) => {
  if (!req.body || !Array.isArray(req.body.tasks)) {
    return res.status(400).json({
      success: false,
      message: "tasks alanı bir dizi olmalıdır.",
    });
  }

  return res.json({
    success: true,
    provider: "mock",
    message: "AI backend bağlantısı çalışıyor.",
    recommendation:
      "Öncelikle yüksek öncelikli ve bugün bitmesi gereken görevleri tamamla.",
  });
});

app.use("/api", (req, res) => {
  res.sendStatus(404);
});

app.use(
  express.static(frontendRoot, {
    dotfiles: "ignore",
  }),
);

app.listen(port, () => {
  console.log(`Osman Todo API listening on port ${port}`);
});
