const express = require("express");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const cors = require("cors");

const app = express();

// CORS + parsers
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get("/healthz", (req, res) => res.send("ok"));

// Connect once on cold start (do not process.exit on failure)
connectDB().then(() => console.log("DB ready")).catch(err => {
  console.error("DB connect error:", err);
});

// API routes
app.use("/url", urlRoute);

app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await URL.findOneAndUpdate(
      { shortId: id },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );
    if (!entry) return res.status(404).send("URL not found");
    res.redirect(entry.redirectURL);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

// IMPORTANT: export handler for Vercel (@vercel/node)
module.exports = (req, res) => app(req, res);
