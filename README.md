# [ SEC_PORT ] — Portfolio Web Server

Kişisel portföy sitesi için güvenlik odaklı bir Node.js/Express web sunucusu.

---

## Özellikler

- **Portföy Sitesi** — Türkçe/İngilizce (TR/EN) dil desteğine sahip, hacker temalı terminal arayüzü
- **İletişim Formu** — Gelen mesajlar `messages.json` dosyasına kaydedilir
- **Rate Limiting** — Her IP için 60 saniyede en fazla 5 istek
- **Şüpheli Trafik Tespiti** — `.env`, `.git`, SQL enjeksiyonu, path traversal gibi saldırı girişimlerini yakalar
- **Karantina Sistemi** — Şüpheli IP'leri 30 dakika karantinaya alır
- **Honeypot (Tuzak) Route'ları** — Tarayıcı botlarını sahte rotalara yönlendirir
- **Güvenlik Olayları Günlüğü** — Olaylar `security-events.jsonl` dosyasına JSONL formatında yazılır
- **Güvenlik Raporu** — Kayıtlı güvenlik olaylarını analiz eden ayrı bir rapor scripti
- **Content Security Policy** — Sıkı bir CSP başlığı ile XSS koruması
- **Uçtan Uca Testler** — `node:test` ile yazılmış test paketi

---

## Kurulum

```bash
git clone https://github.com/somestr/Web_Server.git
cd Web_Server
npm install
```

---

## Kullanım

### Sunucuyu başlat

```bash
npm start
```

### Geliştirme modu (dosya değişikliklerini izler)

```bash
npm run dev
```

### Testleri çalıştır

```bash
npm test
```

### Sözdizimi denetimi

```bash
npm run check
```

### Güvenlik olayları raporu

```bash
npm run security:report
```

---

## Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | `3000` | Sunucunun dinleyeceği port |
| `TRUST_PROXY` | — | Express `trust proxy` ayarı (`loopback`, `linklocal`, `uniquelocal` veya sayı) |
| `CONTACT_MESSAGES_FILE` | `messages.json` | İletişim mesajlarının kaydedileceği dosya yolu |
| `SECURITY_EVENTS_FILE` | `security-events.jsonl` | Güvenlik olayları günlük dosyası |
| `SECURITY_ALERT_WEBHOOK_URL` | — | Yüksek öncelikli güvenlik olayları için webhook URL'i |

---

## Proje Yapısı

```
Web_Server/
├── server.js                      # Ana Express sunucusu
├── index.html                     # Portföy sayfası (ana HTML)
├── style.css                      # Sayfa stilleri
├── script.js                      # Sayfa JavaScript'i
├── i18n.js                        # Çeviri (TR/EN) verileri
├── messages.json                  # Kaydedilen iletişim mesajları
├── public/                        # Statik dosyalar
│   ├── app-utils.js
│   ├── feature-command-palette.js
│   ├── feature-contact.js
│   ├── feature-theme.js
│   ├── i18n.js
│   ├── script.js
│   └── style.css
├── scripts/
│   └── security-events-report.js  # Güvenlik rapor aracı
├── app-utils.test.js              # Yardımcı fonksiyon testleri
├── server.test.js                 # Sunucu entegrasyon testleri
├── security-events-report.test.js # Rapor scripti testleri
└── package.json
```

---

## Güvenlik Mimarisi

```
İstek gelir
    │
    ├─► Karantina kontrolü       (30 dk yasak)
    ├─► Şüpheli URL/Payload taraması
    ├─► Tarayıcı bot tespiti (User-Agent)
    ├─► Rate limiting           (5 istek/dk)
    ├─► Honeypot tuzağı         (/__decoy__/*)
    └─► Normal route işlemi
```

---

## Lisans

ISC
