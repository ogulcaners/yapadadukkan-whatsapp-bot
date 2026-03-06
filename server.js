require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const {
  PORT = 10000,
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  GRAPH_API_VERSION = 'v23.0',
  BUSINESS_NAME = 'YapadaDukkan'
} = process.env;

function getTextMessageBody(text) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    type: 'text',
    text: {
      preview_url: false,
      body: text
    }
  };
}

async function sendWhatsAppMessage(to, messageBody) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      to,
      ...messageBody
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

function normalizeText(value) {
  return (value || '')
    .toString()
    .trim()
    .toLocaleLowerCase('tr-TR');
}

function buildReply(messageText) {
  const text = normalizeText(messageText);

  if (!text) {
    return `Merhaba 👋 ${BUSINESS_NAME} WhatsApp hattına hoş geldiniz.\n\n1) Ürün kategorileri\n2) Mağaza konumu\n3) Çalışma saatleri\n4) Canlı destek\n\nLütfen bir numara yazın.`;
  }

  if (['merhaba', 'selam', 'slm', 's.a', 'sa', 'hey', 'hi', 'hello', 'başla', 'menu', 'menü'].includes(text)) {
    return `Merhaba 👋 ${BUSINESS_NAME} WhatsApp hattına hoş geldiniz.\n\n1) Ürün kategorileri\n2) Mağaza konumu\n3) Çalışma saatleri\n4) Canlı destek\n\nLütfen bir numara yazın.`;
  }

  if (text === '1' || text.includes('ürün') || text.includes('kategori')) {
    return `Kategorilerimiz:\n\n• LEGO\n• Funko Pop\n• Mini GT\n• Kırtasiye\n• Hobi & Sanat\n\nİlgilendiğiniz kategoriyi yazarak devam edebilirsiniz.`;
  }

  if (text === '2' || text.includes('konum') || text.includes('adres') || text.includes('harita')) {
    return `Mağazamız Margi AVM'de hizmet vermektedir.\n\nHarita bağlantınızı buraya ekleyebiliriz.\nÖrnek: https://maps.google.com/...\n\nİsterseniz bunu sizin gerçek konum linkinizle sabitleyelim.`;
  }

  if (text === '3' || text.includes('saat') || text.includes('kaçta') || text.includes('açık') || text.includes('kapalı')) {
    return `Çalışma saatleri bilgisi burada gösterilecek.\n\nÖrnek:\nHafta içi: 10:00 - 22:00\nHafta sonu: 10:00 - 22:00\n\nİsterseniz bunu net saatlerinize göre düzenleyelim.`;
  }

  if (text === '4' || text.includes('canlı') || text.includes('temsilci') || text.includes('destek')) {
    return `Canlı destek talebiniz alındı ✅\nMüsait olan temsilcimiz en kısa sürede size dönüş sağlayacaktır.`;
  }

  if (text.includes('lego')) {
    return `LEGO kategorimiz için yardımcı olayım 🧱\n\nİsterseniz size kategori linki gönderebilir veya aradığınız set adını yazabilirsiniz.`;
  }

  if (text.includes('funko')) {
    return `Funko Pop kategorimiz için yardımcı olayım 🎉\n\nİsterseniz karakter adını veya koleksiyon adını yazabilirsiniz.`;
  }

  if (text.includes('mini gt')) {
    return `Mini GT kategorimiz için yardımcı olayım 🚗\n\nAradığınız model adını yazabilirsiniz.`;
  }

  if (text.includes('kırtasiye') || text.includes('kirtasiye')) {
    return `Kırtasiye kategorimiz için yardımcı olayım ✏️\n\nKalem, defter veya özel koleksiyon ürünleri için ürün adını yazabilirsiniz.`;
  }

  if (text.includes('hobi') || text.includes('sanat')) {
    return `Hobi & Sanat kategorimiz için yardımcı olayım 🎨\n\nPosca, boya veya yardımcı ekipman arıyorsanız ürün adını yazabilirsiniz.`;
  }

  return `Mesajınızı aldım 🙌\n\nSize daha hızlı yardımcı olabilmem için şu seçeneklerden birini yazabilirsiniz:\n1) Ürün kategorileri\n2) Mağaza konumu\n3) Çalışma saatleri\n4) Canlı destek`;
}

app.get('/', (req, res) => {
  res.status(200).send('YapadaDukkan WhatsApp bot çalışıyor.');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const messageType = message.type;
    const text = messageType === 'text' ? message.text?.body : '';

    const reply = buildReply(text);
    await sendWhatsAppMessage(from, getTextMessageBody(reply));

    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.response?.data || error.message);
    return res.sendStatus(200);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.entry) {
    const message = body.entry[0].changes[0].value.messages?.[0];

    if (message) {
      const from = message.from;

      const reply = `
Merhaba 👋

YapadaDükkan WhatsApp destek hattına hoşgeldiniz.

1️⃣ Ürün fiyatı öğren  
2️⃣ Mağaza konumu  
3️⃣ Online mağaza  

Lütfen bir numara yazın.
`;

      await fetch(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            text: { body: reply }
          })
        }
      );
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Bot çalışıyor 🚀");
});
