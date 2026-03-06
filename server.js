require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const {
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID
} = process.env;

const GRAPH_API = "https://graph.facebook.com/v18.0";


// WEBHOOK DOĞRULAMA
app.get('/webhook', (req, res) => {

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Webhook doğrulandı");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});


// MESAJ YAKALAMA
app.post('/webhook', async (req, res) => {

  try {

    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {

      const from = message.from;

      const text = `
Merhaba 👋

YapadaDükkan WhatsApp destek hattına hoşgeldiniz.

1️⃣ Ürün fiyatı öğren  
2️⃣ Mağaza konumu  
3️⃣ Online mağaza  

Lütfen bir numara yazın.
`;

      await axios.post(
        `${GRAPH_API}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

    }

    res.sendStatus(200);

  } catch (error) {

    console.log(error.response?.data || error.message);
    res.sendStatus(500);

  }

});


// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("WhatsApp Bot Çalışıyor 🚀");
});
