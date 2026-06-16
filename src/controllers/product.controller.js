const Product = require('../models/product.model')
const catchAsync = require('../utils/catchAsync')

const getProducts = catchAsync(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100)
    const skip = (page - 1) * limit
    const { search } = req.query

    const filter = {}
    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        filter.name = { $regex: escaped, $options: 'i' }
    }

    const [products, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
    ])

    res.json({
        products,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    })
})

const createProduct = catchAsync(async (req, res) => {
    const { name, tiers, features } = req.body

    const product = await Product.create({
        name,
        tiers,
        features,
    })

    res.status(201).json(product)
})

const getProduct = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
})

const updateProduct = catchAsync(async (req, res) => {
    const { name, tiers, features } = req.body

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { name, tiers, features },
        { new: true, runValidators: true },
    ).lean()

    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
})

const deleteFeature = catchAsync(async (req, res) => {
    const { id, featureId } = req.params

    const product = await Product.findByIdAndUpdate(
        id,
        { $pull: { features: { _id: featureId } } },
        { new: true },
    ).lean()

    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }

    res.json(product)
})

const deleteProduct = catchAsync(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
        return res.status(404).json({ error: 'Product not found' })
    }
    res.status(204).send()
})

module.exports = {
    getProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    deleteFeature,
}
