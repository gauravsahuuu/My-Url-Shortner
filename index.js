const express = require("express");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const cors = require("cors");

const app = express();

// CORS + parsers (before routes)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/healthz", (req, res) => res.send("ok"));

// Connect DB once on cold start (don't call process.exit in serverless)
connectDB()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("DB connection failed:", err));

// Routes
app.use("/url", urlRoute);

app.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const entry = await URL.findOneAndUpdate(
      { shortId: id },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );
    if (!entry) return res.status(404).send("URL not found");
    res.redirect(entry.redirectURL);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// ❗ Vercel: export the handler instead of app.listen(...)
module.exports = app;                 // @vercel/node will use this as the request handler
// or: module.exports = (req, res) => app(req, res);
