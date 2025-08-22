const express = require("express");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// CORS + parsers (before routes)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
// app.options('*', cors()); // ❌ remove in Express 5

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/healthz", (req, res) => res.send("ok"));

// DB
connectDB()
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
