const { buildPlanningPrompt } = require("../services/promptBuilder");

const REQUEST_TIMEOUT_MS = 30_000;

class AzureAIError extends Error {
  constructor(code) {
    super(code);
    this.name = "AzureAIError";
    this.code = code;
  }
}

function getAzureConfiguration(env = process.env) {
  const config = {
    endpoint: env.AZURE_OPENAI_ENDPOINT?.trim(),
    apiKey: env.AZURE_OPENAI_API_KEY?.trim(),
    deployment: env.AZURE_OPENAI_DEPLOYMENT?.trim(),
    apiVersion: env.AZURE_OPENAI_API_VERSION?.trim(),
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new AzureAIError("AZURE_CONFIGURATION_MISSING");
  }

  return config;
}

function isAzureConfigured(env = process.env) {
  try {
    getAzureConfiguration(env);
    return true;
  } catch (error) {
    if (error instanceof AzureAIError) return false;
    throw error;
  }
}

function buildAzureRequestUrl(endpoint, deployment, apiVersion) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new AzureAIError("AZURE_CONFIGURATION_INVALID");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new AzureAIError("AZURE_CONFIGURATION_INVALID");
  }

  const basePath = url.pathname.replace(/\/+$/, "");
  url.pathname = `${basePath}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`;
  url.searchParams.set("api-version", apiVersion);
  return url;
}

function extractAssistantContent(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((part) => part && typeof part.text === "string")
      .map((part) => part.text)
      .join("");
  }
  throw new AzureAIError("AZURE_RESPONSE_INVALID");
}

async function generatePlan(tasks, env = process.env) {
  const config = getAzureConfiguration(env);
  const url = buildAzureRequestUrl(
    config.endpoint,
    config.deployment,
    config.apiVersion,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: buildPlanningPrompt(tasks) }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AzureAIError("AZURE_SERVICE_UNAVAILABLE");
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new AzureAIError("AZURE_RESPONSE_INVALID");
    }

    let result;
    try {
      result = JSON.parse(extractAssistantContent(payload));
    } catch (error) {
      if (error instanceof AzureAIError) throw error;
      throw new AzureAIError("AZURE_RESPONSE_INVALID");
    }

    if (
      !result ||
      typeof result.message !== "string" ||
      typeof result.recommendation !== "string"
    ) {
      throw new AzureAIError("AZURE_RESPONSE_INVALID");
    }

    return {
      message: result.message,
      recommendation: result.recommendation,
    };
  } catch (error) {
    if (error instanceof AzureAIError) throw error;
    if (error.name === "AbortError") {
      throw new AzureAIError("AZURE_REQUEST_TIMEOUT");
    }
    throw new AzureAIError("AZURE_SERVICE_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  AzureAIError,
  generatePlan,
  isAzureConfigured,
};
