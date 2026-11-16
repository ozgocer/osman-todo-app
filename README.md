# Osman Todo

Türkçe arayüzlü, mobil öncelikli görev uygulaması. Görev ekleyebilir, tamamlayabilir ve silebilir; görevlere son tarih, öncelik ve kategori ekleyebilirsin. **AI ile Planla** özelliği tamamlanmamış görevleri tamamen cihaz üzerinde puanlayıp önerilen sıraya dizer; herhangi bir harici AI servisine bağlanmaz. Açık/koyu tema tercihin ve görev listen bu cihazın `localStorage` alanında saklanır. Önceki sürümlerde kaydedilmiş görevler korunur; eksik öncelik ve kategori bilgileri sırasıyla **Orta** ve **Kişisel** kabul edilir.

## Çalıştırma

Uygulamayı bir web sunucusu üzerinden aç. Örneğin, Python kuruluysa depo klasöründe:

```sh
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini ziyaret et. PWA kurulumu ve çevrimdışı kullanım için siteyi HTTPS üzerinden (veya yerel geliştirmede `localhost` adresinde) aç.

## PWA

Uygulama manifest dosyası, Android için 192 × 192 ve 512 × 512 simgeler, ayrıca çevrimdışı uygulama kabuğunu önbelleğe alan bir servis çalışanı içerir. Tarayıcının menüsünden **Ana ekrana ekle** seçeneğiyle yüklenebilir.
