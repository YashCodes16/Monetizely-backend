const { nanoid } = require('nanoid')
const Quote = require('../models/quote.model')
const { computeQuoteLineItems, getTermConfig } = require('../utils/pricing')
const catchAsync = require('../utils/catchAsync')

const getQuotes = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100)
    const skip = (page - 1) * limit

    const [quotes, total] = await Promise.all([
        Quote.find()
            .sort({ createdAt: -1 })
            .select('slug quoteName customerName productSnapshot.productName productSnapshot.tierName seats termLength total createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Quote.countDocuments(),
    ])

    res.json({
        quotes,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    })
})

const createQuote = catchAsync(async (req, res) => {
    const {
        quoteName,
        customerName,
        productId,
        productName,
        tierName,
        basePrice,
        seats,
        termLength,
        addOns,
        overallDiscount,
    } = req.body

    const term = getTermConfig(termLength)

    const addOnInputs = (addOns || []).map(a => ({
        featureName: a.featureName,
        pricingModel: a.pricingModel,
        price: a.price,
        seats: a.seats,
    }))

    const { lineItems, total } = computeQuoteLineItems({
        productName,
        tierName,
        basePrice,
        seats,
        termLength,
        addOns: addOnInputs,
        overallDiscount,
    })

    const quote = await Quote.create({
        slug: nanoid(10),
        quoteName,
        customerName,
        productSnapshot: {
            productId,
            productName,
            tierName,
            basePrice,
        },
        seats,
        termLength,
        termMultiplier: term.multiplier,
        discountPercent: term.discount,
        addOns: addOnInputs,
        overallDiscount,
        lineItems,
        total,
    })

    res.status(201).json(quote)
})

const getQuoteBySlug = catchAsync(async (req, res) => {
    const quote = await Quote.findOne({ slug: req.params.slug }).lean()
    if (!quote) {
        return res.status(404).json({ error: 'Quote not found' })
    }
    res.json(quote)
})

const deleteQuote = catchAsync(async (req, res) => {
    const quote = await Quote.findOneAndDelete({ slug: req.params.slug })
    if (!quote) {
        return res.status(404).json({ error: 'Quote not found' })
    }
    res.status(204).send()
})

module.exports = {
    getQuotes,
    createQuote,
    getQuoteBySlug,
    deleteQuote,
}
