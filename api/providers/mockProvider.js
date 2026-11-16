async function generatePlan() {
  return {
    success: true,
    provider: "mock",
    message: "AI backend bağlantısı çalışıyor.",
    recommendation:
      "Öncelikle yüksek öncelikli ve bugün bitmesi gereken görevleri tamamla.",
  };
}

module.exports = { generatePlan };
