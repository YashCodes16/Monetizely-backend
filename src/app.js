const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const productRoutes = require('./routes/product.routes')
const quoteRoutes = require('./routes/quote.routes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    }
    res.json({
        status: 'ok',
        db: stateMap[dbState] || 'unknown'
        })
})

app.use('/api/products', productRoutes)
app.use('/api/quotes', quoteRoutes)

app.use(errorHandler)

module.exports = app
