require('dotenv').config()

const mongoose = require('mongoose')
const app = require('../src/app')

let isConnected = false

async function connectDB() {
    if (isConnected) return

    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not defined')
    }

    await mongoose.connect(uri)
    isConnected = true
}

module.exports = async (req, res) => {
    await connectDB()
    app(req, res)
}
