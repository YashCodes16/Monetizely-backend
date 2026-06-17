require('dotenv').config()

const app = require('../src/app')
const connectDB = require('../src/db/connect')

module.exports = async (req, res) => {
    try {
        await connectDB()
    } catch (err) {
        res.status(500).json({ error: 'DB connection failed', message: err.message })
        return
    }
    app(req, res)
}
