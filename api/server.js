require("dotenv").config();

const cors = require("cors");
const express = require("express");
const path = require("node:path");
const aiService = require("./services/aiService");
const azureOpenAIProvider = require("./providers/azureOpenAIProvider");

const app = express();
const port = process.env.PORT || 3000;
const frontendRoot = path.resolve(__dirname, "..");
const allowedTaskFields = new Set(["title", "priority", "category", "dueDate"]);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: aiService.getSelectedProvider(),
    azureConfigured: azureOpenAIProvider.isAzureConfigured(),
  });
});

app.post("/api/plan", async (req, res) => {
  const tasks = req.body?.tasks;
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    !Array.isArray(tasks)
  ) {
    return res.status(400).json({
      success: false,
      message: "İstek gövdesinde tasks alanı bir dizi olmalıdır.",
    });
  }

  console.log(`POST /api/plan tasks=${tasks.length}`);
  if (tasks.length > 100) {
    return res.status(400).json({
      success: false,
      message: "En fazla 100 görev gönderilebilir.",
    });
  }

  const normalizedTasks = [];
  for (const task of tasks) {
    if (
      !task ||
      typeof task !== "object" ||
      Array.isArray(task) ||
      Object.keys(task).some((field) => !allowedTaskFields.has(field)) ||
      typeof task.title !== "string" ||
      !task.title.trim() ||
      ["priority", "category", "dueDate"].some(
        (field) => task[field] !== undefined && typeof task[field] !== "string",
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Her görev geçerli bir başlık ve yalnızca desteklenen alanları içermelidir.",
      });
    }

    normalizedTasks.push({
      title: task.title.trim(),
      ...(task.priority !== undefined && { priority: task.priority }),
      ...(task.category !== undefined && { category: task.category }),
      ...(task.dueDate !== undefined && { dueDate: task.dueDate }),
    });
  }

  try {
    const result = await aiService.createPlan(normalizedTasks);
    console.log(
      `provider=${aiService.getSelectedProvider()} tasks=${tasks.length} fallback=${Boolean(result.fallback)}`,
    );
    return res.json(result);
  } catch (error) {
    if (error instanceof aiService.AIServiceError) {
      if (error.code === "AZURE_UNAVAILABLE") {
        console.log(
          `provider=${aiService.getSelectedProvider()} tasks=${tasks.length} fallback=false`,
        );
        return res.status(503).json({
          success: false,
          message: "AI servisi şu anda kullanılamıyor.",
        });
      }
      if (error.code === "AI_PROVIDER_UNSUPPORTED") {
        console.log(
          `provider=${aiService.getSelectedProvider()} tasks=${tasks.length} fallback=false`,
        );
        return res.status(500).json({
          success: false,
          message: "AI sağlayıcı yapılandırması desteklenmiyor.",
        });
      }
    }

    console.log(
      `provider=${aiService.getSelectedProvider()} tasks=${tasks.length} fallback=false`,
    );
    return res.status(500).json({
      success: false,
      message: "Beklenmeyen bir sunucu hatası oluştu.",
    });
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status === 413 ? 413 : 400;
  return res.status(status).json({
    success: false,
    message: status === 413 ? "İstek gövdesi çok büyük." : "Geçersiz JSON isteği.",
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
  console.log(`provider=${aiService.getSelectedProvider()}`);
});
