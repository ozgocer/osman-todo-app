function buildPlanningPrompt(incompleteTasks) {
  return [
    "Sen Osman Todo için görev planlama yardımcısısın.",
    "Aşağıdaki tamamlanmamış görevleri Türkçe olarak değerlendir.",
    "Süresi geçmiş ve yüksek öncelikli görevlere öncelik ver; son tarihleri ve kategorileri dikkate al.",
    "Kısa ve uygulanabilir Türkçe öneriler üret. Listede olmayan görevler uydurma veya ekleme.",
    'Yalnızca geçerli JSON döndür; açıklama, Markdown veya kod bloğu ekleme. JSON biçimi: {"message":"Kısa genel değerlendirme","recommendation":"Görevlerin nasıl sıralanacağına ilişkin öneri"}',
    "Görevler:",
    JSON.stringify(incompleteTasks),
  ].join("\n");
}

module.exports = { buildPlanningPrompt };
