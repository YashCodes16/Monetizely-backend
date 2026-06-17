const mongoose = require('mongoose')

let cached = null

async function connectDB() {
    if (cached && mongoose.connection.readyState === 1) {
        return cached
    }

    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not defined')
    }

    cached = await mongoose.connect(uri)

    // On serverless cold starts, wait for the connection to be fully ready
    if (mongoose.connection.readyState !== 1) {
        await new Promise((resolve, reject) => {
            mongoose.connection.once('connected', resolve)
            mongoose.connection.once('error', reject)
        })
    }

    return cached
}

module.exports = connectDB
