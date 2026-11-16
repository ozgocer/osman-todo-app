# Osman Todo

Türkçe arayüzlü, mobil öncelikli görev uygulaması. Görev ekleyebilir, tamamlayabilir ve silebilir; görevlere son tarih, öncelik ve kategori ekleyebilirsin. **AI ile Planla** özelliği tamamlanmamış görevleri tamamen cihaz üzerinde puanlayıp önerilen sıraya dizer; herhangi bir harici AI servisine bağlanmaz. Açık/koyu tema tercihin ve görev listen bu cihazın `localStorage` alanında saklanır. Önceki sürümlerde kaydedilmiş görevler korunur; eksik öncelik ve kategori bilgileri sırasıyla **Orta** ve **Kişisel** kabul edilir.

## Çalıştırma

İlk çalıştırmada API bağımlılıklarını kur:

```sh
cd api
npm install
```

Ardından backend'i başlat; aynı sunucu hem API'yi hem de frontend'i `http://localhost:3000` adresinde sunar:

```sh
npm start
```

## AI sağlayıcı mimarisi

`api/services/aiService.js`, `AI_PROVIDER` değerine göre `mock` veya `azure` sağlayıcısını seçer. Sağlayıcılar `api/providers/` altında, prompt üretimi ise `api/services/promptBuilder.js` içindedir. Varsayılan sağlayıcı `mock` olup dış servise bağlanmaz.

Örnek ayarlar `api/.env.example` dosyasındadır. İsteğe bağlı Azure kullanımı için `api/.env` dosyasını yerel olarak oluştur ve `AI_PROVIDER=azure` ile aşağıdaki değişkenleri kendi Azure kaynağından aldığın değerlerle doldur:

- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI kaynağının HTTPS endpoint'i.
- `AZURE_OPENAI_API_KEY`: sunucu tarafında kullanılan gizli anahtar.
- `AZURE_OPENAI_DEPLOYMENT`: dağıtım adı.
- `AZURE_OPENAI_API_VERSION`: Azure tarafından desteklenen API sürümü; örnek dosyadaki yer tutucuyu değiştir.
- `AI_FALLBACK_TO_MOCK`: Azure kullanılamadığında `true` (varsayılan) ile mock yanıtı ve `fallback: true` döndürür; `false` ile HTTP 503 döndürür.
- `PORT`: sunucu portu; varsayılan `3000`.

Gerçek Azure değerleri depoya eklenmemelidir. **`api/.env` dosyasını asla Git'e commit etmeyin**; bu dosya `.gitignore` ile yok sayılır. API anahtarını yalnızca backend ortamında tutun.

## API örnekleri

Sağlık kontrolü:

```sh
curl http://localhost:3000/api/health
```

Plan isteği:

```sh
curl -X POST http://localhost:3000/api/plan \
  -H 'Content-Type: application/json' \
  -d '{"tasks":[{"title":"Haftalık planı hazırla","priority":"Yüksek","category":"İş","dueDate":"2026-11-17"}]}'
```

Frontend'de API base URL boş bırakıldığında istek aynı origin'deki `/api/plan` adresine gider. Harici bir deployment (ör. Azure'da barındırılan API) için bu alana API'nin base URL'si girilebilir.

## PWA

Uygulama manifest dosyası, Android için 192 × 192 ve 512 × 512 simgeler, ayrıca çevrimdışı uygulama kabuğunu önbelleğe alan bir servis çalışanı içerir. Tarayıcının menüsünden **Ana ekrana ekle** seçeneğiyle yüklenebilir. Codespaces'te PWA kurulumu için port 3000'i public/forwarded HTTPS URL üzerinden aç.
