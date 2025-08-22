const express = require("express");
const { connectDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = process.env.PORT || 8000;


app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // (optional) for form posts

// Connect to DB
connectDB().then(() => {
  console.log("connected to DB");
});

// Mount router
app.use("/url", urlRoute);

// Redirect route
app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const entry = await URL.findOneAndUpdate(
    { shortId: id }, // query by shortId
    {
      $push: {
        visitHistory: { timestamp: Date.now() }, // <-- fixed
      },
    },
    { new: true }
  );

  if (!entry) {
    return res.status(404).send("URL not found");
  }

  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
