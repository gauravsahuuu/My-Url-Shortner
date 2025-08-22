const { nanoid } = require('nanoid');
const URL = require('../models/url');

const MAX_RETRIES = 5;

async function generateNewShortURL(req, res) {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url is required' });

  // reuse if same long url
  const existing = await URL.findOne({ redirectURL: url });
  if (existing) return res.json({ id: existing.shortId, reused: true });

  for (let i = 0; i < MAX_RETRIES; i++) {
    const shortId = nanoid(8); // create id
    try {
      const doc = await URL.create({
        shortId,
        redirectURL: url,
        visitHistory: [],
      });
      return res.json({ id: doc.shortId }); // ok
    } catch (err) {
      if (err && err.code === 11000) continue; // duplicate -> retry
      return res.status(500).json({ error: 'server error' });
    }
  }

  return res.status(500).json({ error: 'could not generate id' });
}

module.exports = { generateNewShortURL };
