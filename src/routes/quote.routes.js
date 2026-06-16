const { Router } = require('express')
const validate = require('../middlewares/validate')
const quoteValidation = require('../validations/quote.validation')
const {
    getQuotes,
    createQuote,
    getQuoteBySlug,
    deleteQuote,
} = require('../controllers/quote.controller')

const router = Router()

router.get('/', getQuotes)
router.post('/', validate(quoteValidation.createQuote), createQuote)
router.get('/:slug', getQuoteBySlug)
router.delete('/:slug', deleteQuote)

module.exports = router
