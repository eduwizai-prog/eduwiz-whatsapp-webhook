import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Verify webhook
app.get("/webhook", (req, res) => {
  const verifyToken = "eduwizverifytoken";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object) {
    const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
    if (messages && messages[0]) {
      const from = messages[0].from;
      const msgBody = messages[0].text?.body || "";

      console.log("Received message:", msgBody);

      // Send auto-reply
      sendReply(from);
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Auto-reply function
async function sendReply(to) {
  const url = "https://graph.facebook.com/v24.0/YOUR_PHONE_NUMBER_ID/messages";
  const token = "YOUR_WHATSAPP_ACCESS_TOKEN";

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    text: { body: "👋 Hello! I’m Eduwiz AI — your study assistant for WAEC, JAMB, NECO, and GCE. Type 'menu' to get started." }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log("Reply sent:", result);
}

app.listen(10000, () => console.log("🚀 Webhook running on port 10000"));
