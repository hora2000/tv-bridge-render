import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Healthcheck
app.get("/", (req, res) => res.status(200).send("OK - TV Bridge is alive"));

// Endpoint per ricevere i segnali da TradingView
app.post("/hook", async (req, res) => {
  try {
    const payload = req.body || {};
    const text = typeof payload === "string" ? payload : (payload.text || JSON.stringify(payload));

    console.log("🛰️  Signal IN:", text);

    // (Facoltativo) Invia anche su Telegram se configurato
    if (process.env.TG_TOKEN && process.env.TG_CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`, {
        chat_id: process.env.TG_CHAT_ID,
        text
      }).catch(e => console.log("Telegram forward skipped:", e.message));
    }

    res.status(200).json({ ok: true, received: text });
  } catch (e) {
    console.error("ERR /hook:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ TV Bridge listening on ${port}`));
