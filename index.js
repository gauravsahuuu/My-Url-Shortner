const express = require("express");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/healthz", (req, res) => res.send("ok"));

// Connect to DB
connectDB()
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1); // fail fast so Render restarts
  });

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
