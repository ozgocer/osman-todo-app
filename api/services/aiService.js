const mockProvider = require("../providers/mockProvider");
const azureOpenAIProvider = require("../providers/azureOpenAIProvider");

class AIServiceError extends Error {
  constructor(code) {
    super(code);
    this.name = "AIServiceError";
    this.code = code;
  }
}

function getSelectedProvider(env = process.env) {
  return (env.AI_PROVIDER || "mock").trim().toLowerCase();
}

function isFallbackEnabled(env = process.env) {
  const configured = env.AI_FALLBACK_TO_MOCK;
  if (configured === undefined) return true;
  return ["true", "1", "yes", "on"].includes(configured.trim().toLowerCase());
}

function normalizeResult(result, provider, extra = {}) {
  if (
    !result ||
    typeof result.message !== "string" ||
    typeof result.recommendation !== "string"
  ) {
    throw new AIServiceError("AI_RESPONSE_INVALID");
  }

  return {
    success: true,
    provider,
    message: result.message,
    recommendation: result.recommendation,
    ...extra,
  };
}

async function createPlan(tasks, env = process.env) {
  const provider = getSelectedProvider(env);

  if (provider === "mock") {
    return normalizeResult(await mockProvider.generatePlan(tasks), "mock");
  }

  if (provider !== "azure") {
    throw new AIServiceError("AI_PROVIDER_UNSUPPORTED");
  }

  try {
    const result = await azureOpenAIProvider.generatePlan(tasks, env);
    return normalizeResult(result, "azure");
  } catch (error) {
    if (!(error instanceof azureOpenAIProvider.AzureAIError)) throw error;
    if (isFallbackEnabled(env)) {
      const fallbackResult = await mockProvider.generatePlan(tasks);
      return normalizeResult(fallbackResult, "mock", { fallback: true });
    }
    throw new AIServiceError("AZURE_UNAVAILABLE");
  }
}

module.exports = {
  AIServiceError,
  createPlan,
  getSelectedProvider,
  isFallbackEnabled,
};
