import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "eduwizverifytoken";
const WHATSAPP_TOKEN = "YOUR_WHATSAPP_ACCESS_TOKEN"; // Replace with actual token

// ✅ Verification endpoint
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Receiving messages
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const name = message.profile?.name;
      const text = message.text?.body;

      console.log(`📩 Message from ${name}: ${text}`);

      // Auto reply
      const reply = `👋 Hello ${name || "there"}! 
Welcome to *Eduwiz AI*. 
I’m your learning assistant for WAEC, NECO, JAMB & GCE exam prep.`;

      await fetch("https://graph.facebook.com/v20.0/YOUR_PHONE_NUMBER_ID/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: reply },
        }),
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.sendStatus(500);
  }
});

app.listen(10000, () => console.log("🚀 Webhook running on port 10000"));
