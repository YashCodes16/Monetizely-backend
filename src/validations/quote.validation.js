const Joi = require('joi')

const addOnSchema = Joi.object({
    featureName: Joi.string().required(),
    pricingModel: Joi.string().valid('fixed', 'per_seat', 'percentage').required(),
    price: Joi.number().required(),
    seats: Joi.number(),
})

const createQuote = Joi.object({
    quoteName: Joi.string().required(),
    customerName: Joi.string().required(),
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    tierName: Joi.string().required(),
    basePrice: Joi.number().positive().required(),
    seats: Joi.number().integer().positive().required(),
    termLength: Joi.string().valid('monthly', 'annual', 'two_year').required(),
    addOns: Joi.array().items(addOnSchema).default([]),
    overallDiscount: Joi.number().min(0).max(100),
})

module.exports = {
    createQuote,
}
