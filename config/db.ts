import mongoose from "mongoose";

const DB_URL = process.env.DB_URL!
const mongo = mongoose.connect(DB_URL)
const conn = mongoose.connection

conn.on('error', () => {
  console.log('connection failed')
  process.exit
})

export default mongo