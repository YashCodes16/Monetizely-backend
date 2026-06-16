const { Router } = require('express')
const validate = require('../middlewares/validate')
const productValidation = require('../validations/product.validation')
const {
    getProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    deleteFeature,
} = require('../controllers/product.controller')

const router = Router()

router.get('/', getProducts)
router.post('/', validate(productValidation.createProduct), createProduct)
router.get('/:id', getProduct)
router.put('/:id', validate(productValidation.updateProduct), updateProduct)
router.delete('/:id', deleteProduct)
router.delete('/:id/features/:featureId', deleteFeature)

module.exports = router
