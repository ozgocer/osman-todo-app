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
cd api
npm start
```

`POST /api/plan`, `tasks` dizisini alıp şimdilik mock bir öneri döndürür; henüz bir AI sağlayıcısına bağlanmaz. API base URL alanını boş bırakırsan frontend aynı origin'deki `/api/plan` adresini kullanır. Farklı bir servis (ör. Azure) kullanırken bu alana servis base URL'sini girebilirsin. `AI_API_KEY` gelecekteki sunucu tarafı sağlayıcı entegrasyonu için ayrılmıştır ve şu anda gerekli değildir.

## PWA

Uygulama manifest dosyası, Android için 192 × 192 ve 512 × 512 simgeler, ayrıca çevrimdışı uygulama kabuğunu önbelleğe alan bir servis çalışanı içerir. Tarayıcının menüsünden **Ana ekrana ekle** seçeneğiyle yüklenebilir. Codespaces'te PWA kurulumu için port 3000'i public/forwarded HTTPS URL üzerinden aç.
