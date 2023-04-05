const mongoose = require("mongoose")

const url = process.env.MONGO_URL
console.log(`Database URL: ${url}`)

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(url)
    console.log("Database connected ", connect.connection.host, connect.connection.name)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

module.exports = connectDb