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

function log(title, data) {
  console.log(`\n=== ${title} ===`);
  if (typeof data === "string") {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log("=== END ===\n");
}

async function sendWhatsAppText(to, body) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;

  log("MESAJ GONDERILIYOR", { to, body });

  const response = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: to,
      text: { body: body }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  log("META CEVABI", response.data);
  return response.data;
}

function getWelcomeMessage() {
  return (
`Merhaba 👋

YapadaDükkan WhatsApp destek hattına hoş geldiniz.

1️⃣ Ürün fiyatı öğren
2️⃣ Mağaza konumu
3️⃣ Online mağaza

Lütfen bir numara yazın.`
  );
}

function getReplyByUserMessage(text) {
  const clean = (text || "").trim().toLowerCase();

  if (clean === "1") {
    return "Lütfen ürün adını veya barkod numarasını yazın.";
  }

  if (clean === "2") {
    return "Mağaza konumu için buraya bakabilirsiniz: https://maps.google.com/?q=Margi+AVM";
  }

  if (clean === "3") {
    return "Online mağazamız: https://yapadadukkan.com";
  }

  return getWelcomeMessage();
}

app.get("/", (req, res) => {
  res.status(200).send("Bot ayakta");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  log("WEBHOOK GET", { mode, token, challenge, verifyTokenInServer: VERIFY_TOKEN });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    log("WEBHOOK POST GELDI", req.body);

    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) {
      log("MESAJ YOK", "Bu event mesaj degil. Status veya baska bir event olabilir.");
      return res.sendStatus(200);
    }

    const from = message.from;
    const messageType = message.type;

    log("MESAJ BULUNDU", {
      from,
      messageType,
      fullMessage: message
    });

    let userText = "";

    if (messageType === "text") {
      userText = message.text?.body || "";
    } else {
      userText = "";
    }

    log("KULLANICI MESAJI", userText || "(text degil)");

    const replyText = getReplyByUserMessage(userText);

    await sendWhatsAppText(from, replyText);

    return res.sendStatus(200);
  } catch (error) {
    log("HATA", error.response?.data || error.message || error);
    return res.sendStatus(500);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WhatsApp Bot Calisiyor 🚀 Port: ${PORT}`);
});
