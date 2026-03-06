# YapadaDukkan WhatsApp Bot Starter

Bu paket, Meta WhatsApp Business Platform (Cloud API) ile çalışan başlangıç seviyesi bir Node.js + Express chatbot iskeletidir.

## Dosyalar

- `server.js` → webhook ve mesaj cevap mantığı
- `package.json` → bağımlılıklar ve komutlar
- `.env.example` → doldurulacak gizli değişken örneği

## Kurulum

### 1) Lokal test
```bash
npm install
cp .env.example .env
npm start
```

### 2) Render'a yükleme

Render üzerinde yeni bir **Web Service** oluşturun ve GitHub reponuzu bağlayın.

Önerilen ayarlar:

- Build Command: `npm install`
- Start Command: `npm start`

### 3) Environment Variables

Render içine şunları ekleyin:

- `PORT` = `10000`
- `VERIFY_TOKEN` = sizin belirleyeceğiniz doğrulama anahtarı
- `WHATSAPP_TOKEN` = Meta access token
- `PHONE_NUMBER_ID` = WhatsApp phone number ID
- `GRAPH_API_VERSION` = `v23.0`
- `BUSINESS_NAME` = `YapadaDukkan`

### 4) Meta Webhook Ayarı

Webhook URL:

```text
https://SIZIN-RENDER-ADRESINIZ.onrender.com/webhook
```

Verify Token:

```text
.env içindeki VERIFY_TOKEN ile aynı olmalı
```

### 5) Test mesajları

Aşağıdaki örnekleri yazınca bot cevap verir:

- `Merhaba`
- `1`
- `2`
- `3`
- `4`
- `lego`
- `funko`
- `mini gt`
- `kırtasiye`
- `hobi sanat`

## Sonraki geliştirmeler

Bu başlangıç paketine daha sonra şunlar eklenebilir:

- gerçek ürün verisi çekme
- kategori linkleri
- canlı destek kuyruğu
- sipariş sorgulama
- XML / JSON ürün entegrasyonu
- özel kampanya akışları
