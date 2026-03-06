require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const PORT = process.env.PORT || 10000;
const GRAPH_API_VERSION = "v18.0";

async function sendWhatsAppText(to, body) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

function getMenuMessage() {
  return `Merhaba 👋

YapadaDükkan WhatsApp destek hattına hoş geldiniz.

Size daha hızlı yardımcı olabilmemiz için aşağıdaki menüden seçim yapabilirsiniz:

1️⃣ Ürün bilgisi
2️⃣ Mağaza konumu
3️⃣ Online mağaza
4️⃣ Instagram
5️⃣ Canlı destek

Lütfen yalnızca ilgili numarayı yazın.

Ana menüye dönmek için dilediğiniz zaman "menü" yazabilirsiniz.`;
}

function getReplyByUserMessage(text) {
  const clean = (text || "").trim().toLowerCase();

  const menuWords = [
    "merhaba",
    "selam",
    "merhaba!",
    "selam!",
    "hi",
    "hello",
    "menu",
    "menü",
    "başla",
    "basla",
    "start"
  ];

  if (menuWords.includes(clean)) {
    return getMenuMessage();
  }

  if (clean === "1") {
    return `Ürün bilgisi talebiniz alındı 📦

Aradığınız ürünün adını bu mesaja yazarak bize iletebilirsiniz.

Örnek:
• LEGO Star Wars
• Funko Pop
• Harry Potter defter
• Mini GT

Ekibimiz en kısa sürede size yardımcı olacaktır.

Ana menüye dönmek için "menü" yazabilirsiniz.`;
  }

  if (clean === "2") {
    return `Mağazamızın konum bilgisi aşağıdadır 📍

YapadaDükkan
Margi AVM, Edirne

Konum bağlantısı:
https://maps.google.com/?q=Margi+AVM+Edirne

Ana menüye dönmek için "menü" yazabilirsiniz.`;
  }

  if (clean === "3") {
    return `Online mağazamıza aşağıdaki bağlantı üzerinden ulaşabilirsiniz 🌐

https://yapadadukkan.com

Ana menüye dönmek için "menü" yazabilirsiniz.`;
  }

  if (clean === "4") {
    return `Instagram hesabımız üzerinden güncel ürünlerimizi ve paylaşımlarımızı inceleyebilirsiniz ✨

https://instagram.com/yapadadukkan

Ana menüye dönmek için "menü" yazabilirsiniz.`;
  }

  if (clean === "5") {
    return `Canlı destek talebiniz alınmıştır 🤝

Müsait olan ekibimiz en kısa sürede sizinle ilgilenecektir.

Bu arada dilerseniz ürün adı, kategori veya talebinizi kısa şekilde bu mesaja yazabilirsiniz.

Ana menüye dönmek için "menü" yazabilirsiniz.`;
  }

  return `Mesajınızı aldım 💬

Size daha hızlı yardımcı olabilmemiz için aşağıdaki menüden seçim yapabilirsiniz:

1️⃣ Ürün bilgisi
2️⃣ Mağaza konumu
3️⃣ Online mağaza
4️⃣ Instagram
5️⃣ Canlı destek

Lütfen bir numara yazın.

Ana menüye dönmek için "menü" yazabilirsiniz.`;
}

app.get("/", (req, res) => {
  res.status(200).send("YapadaDükkan WhatsApp Bot V2 Premium çalışıyor");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const messageType = message.type;

    let userText = "";

    if (messageType === "text") {
      userText = message.text?.body || "";
    }

    const replyText = getReplyByUserMessage(userText);
    await sendWhatsAppText(from, replyText);

    return res.sendStatus(200);
  } catch (error) {
    console.log(error.response?.data || error.message || error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`YapadaDükkan WhatsApp Bot V2 Premium çalışıyor 🚀 Port: ${PORT}`);
});
