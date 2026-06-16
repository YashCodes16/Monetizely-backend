const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSnapshotSchema = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    tierName: { type: String, required: true },
    basePrice: { type: Number, required: true },
}, { _id: false })

const AddOnSchema = new Schema({
    featureName: { type: String, required: true },
    pricingModel: {
        type: String,
        enum: ['fixed', 'per_seat', 'percentage'],
        required: true,
    },
    price: { type: Number, required: true },
    seats: Number,
}, { _id: false })

const LineItemSchema = new Schema({
    label: { type: String, required: true },
    calculation: { type: String, required: true },
    notes: { type: String, default: '' },
    amount: { type: Number, required: true },
}, { _id: false })

const QuoteSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    quoteName: { type: String, required: true },
    customerName: { type: String, required: true },
    productSnapshot: { type: ProductSnapshotSchema, required: true },
    seats: { type: Number, required: true },
    termLength: {
        type: String,
        enum: ['monthly', 'annual', 'two_year'],
        required: true,
    },
    termMultiplier: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    addOns: [AddOnSchema],
    overallDiscount: Number,
    lineItems: [LineItemSchema],
    total: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Quote', QuoteSchema)
