const Joi = require('joi')

const basePriceSchema = Joi.object({
    value: Joi.number().min(0).required(),
    frequency: Joi.string().valid('monthly', 'annual', 'yearly').default('monthly'),
})

const tierSchema = Joi.object({
    name: Joi.string().required(),
    basePrice: basePriceSchema.required(),
})

const tierFeatureSchema = Joi.object({
    tierName: Joi.string().required(),
    availability: Joi.string().valid('included', 'addon', 'not_available').required(),
    pricingModel: Joi.string().valid('fixed', 'per_seat', 'percentage'),
    price: Joi.number(),
})

const featureSchema = Joi.object({
    name: Joi.string().required(),
    tiers: Joi.array().items(tierFeatureSchema).default([]),
})

const createProduct = Joi.object({
    name: Joi.string().required(),
    tiers: Joi.array().items(tierSchema).min(1).required(),
    features: Joi.array().items(featureSchema).default([]),
})

const updateProduct = Joi.object({
    name: Joi.string(),
    tiers: Joi.array().items(tierSchema).min(1),
    features: Joi.array().items(featureSchema),
})

module.exports = {
    createProduct,
    updateProduct,
}
