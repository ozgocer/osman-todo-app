# Osman Todo

Türkçe arayüzlü, mobil öncelikli görev uygulaması. Görev ekleyebilir, tamamlayabilir ve silebilirsin; listen bu cihazın `localStorage` alanında saklanır.

## Çalıştırma

Uygulamayı bir web sunucusu üzerinden aç. Örneğin, Python kuruluysa depo klasöründe:

```sh
python3 -m http.server 8000
```

Ardından `http://localhost:8000` adresini ziyaret et. PWA kurulumu ve çevrimdışı kullanım için siteyi HTTPS üzerinden (veya yerel geliştirmede `localhost` adresinde) aç.

## PWA

Uygulama manifest dosyası, Android için 192 × 192 ve 512 × 512 simgeler, ayrıca çevrimdışı uygulama kabuğunu önbelleğe alan bir servis çalışanı içerir. Tarayıcının menüsünden **Ana ekrana ekle** seçeneğiyle yüklenebilir.
