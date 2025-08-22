const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');

const ATLAS_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://mycardiocareindia:fAYPdnLhlkkv34pl@cluster0.9tthxnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {

  await mongoose.connect(ATLAS_URI);
  console.log("Mongoose connected to Atlas");

  return mongoose;
  
}

module.exports = { connectDB };
