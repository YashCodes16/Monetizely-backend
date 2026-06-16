const quoteValidation = require('../src/validations/quote.validation')

describe('quote validation - createQuote', () => {
    const schema = quoteValidation.createQuote

    const validQuote = {
        quoteName: 'Q3 Proposal',
        customerName: 'Acme Corp',
        productId: '507f1f77bcf86cd799439011',
        productName: 'Analytics Suite',
        tierName: 'Growth',
        basePrice: 50,
        seats: 25,
        termLength: 'annual',
        addOns: [
            { featureName: 'SSO', pricingModel: 'fixed', price: 200 },
            { featureName: 'API', pricingModel: 'per_seat', price: 10, seats: 5 },
        ],
        overallDiscount: 10,
    }

    it('passes for a valid quote', () => {
        const { error } = schema.validate(validQuote)
        expect(error).toBeUndefined()
    })

    it('passes with no add-ons', () => {
        const { error, value } = schema.validate({
            ...validQuote,
            addOns: undefined,
        })
        expect(error).toBeUndefined()
        expect(value.addOns).toEqual([])
    })

    it('passes without overallDiscount', () => {
        const { overallDiscount, ...rest } = validQuote
        const { error } = schema.validate(rest)
        expect(error).toBeUndefined()
    })

    it('fails when quoteName is missing', () => {
        const { quoteName, ...rest } = validQuote
        const { error } = schema.validate(rest)
        expect(error).toBeDefined()
    })

    it('fails when customerName is missing', () => {
        const { customerName, ...rest } = validQuote
        const { error } = schema.validate(rest)
        expect(error).toBeDefined()
    })

    it('fails when seats is 0', () => {
        const { error } = schema.validate({ ...validQuote, seats: 0 })
        expect(error).toBeDefined()
    })

    it('fails when seats is negative', () => {
        const { error } = schema.validate({ ...validQuote, seats: -5 })
        expect(error).toBeDefined()
    })

    it('fails when basePrice is 0 or negative', () => {
        const { error } = schema.validate({ ...validQuote, basePrice: 0 })
        expect(error).toBeDefined()
    })

    it('fails for invalid termLength', () => {
        const { error } = schema.validate({ ...validQuote, termLength: 'weekly' })
        expect(error).toBeDefined()
    })

    it('accepts all valid termLength values', () => {
        for (const term of ['monthly', 'annual', 'two_year']) {
            const { error } = schema.validate({ ...validQuote, termLength: term })
            expect(error).toBeUndefined()
        }
    })

    it('fails when add-on pricingModel is invalid', () => {
        const { error } = schema.validate({
            ...validQuote,
            addOns: [{ featureName: 'X', pricingModel: 'usage', price: 10 }],
        })
        expect(error).toBeDefined()
    })

    it('fails when add-on is missing required fields', () => {
        const { error } = schema.validate({
            ...validQuote,
            addOns: [{ featureName: 'X' }],
        })
        expect(error).toBeDefined()
    })

    it('fails when overallDiscount exceeds 100', () => {
        const { error } = schema.validate({ ...validQuote, overallDiscount: 150 })
        expect(error).toBeDefined()
    })

    it('fails when overallDiscount is negative', () => {
        const { error } = schema.validate({ ...validQuote, overallDiscount: -5 })
        expect(error).toBeDefined()
    })
})
