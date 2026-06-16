const express = require('express')
const cors = require('cors')
const productRoutes = require('./routes/product.routes')
const quoteRoutes = require('./routes/quote.routes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/quotes', quoteRoutes)

app.use(errorHandler)

module.exports = app
