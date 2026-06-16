const mongoose = require('mongoose')
const { Schema } = mongoose

const TierFeatureSchema = new Schema({
    tierName: { type: String, required: true },
    availability: {
        type: String,
        enum: ['included', 'addon', 'not_available'],
        required: true,
    },
    pricingModel: {
        type: String,
        enum: ['fixed', 'per_seat', 'percentage'],
    },
    price: Number,
}, { _id: false })

const FeatureSchema = new Schema({
    name: { type: String, required: true },
    tiers: [TierFeatureSchema],
})

const BasePriceSchema = new Schema({
    value: { type: Number, required: true },
    frequency: {
        type: String,
        enum: ['monthly', 'annual', 'yearly'],
        default: 'monthly',
    },
}, { _id: false })

const TierSchema = new Schema({
    name: { type: String, required: true },
    basePrice: { type: BasePriceSchema, required: true },
}, { _id: false })

const ProductSchema = new Schema({
    name: { type: String, required: true },
    tiers: [TierSchema],
    features: [FeatureSchema],
}, { timestamps: true })

module.exports = mongoose.model('Product', ProductSchema)
