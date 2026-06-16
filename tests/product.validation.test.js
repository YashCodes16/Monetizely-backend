const productValidation = require('../src/validations/product.validation')

describe('product validation - createProduct', () => {
    const schema = productValidation.createProduct

    it('passes for a valid product', () => {
        const { error } = schema.validate({
            name: 'Analytics Suite',
            tiers: [
                { name: 'Starter', basePrice: { value: 25, frequency: 'monthly' } },
                { name: 'Pro', basePrice: { value: 50 } },
            ],
            features: [
                {
                    name: 'SSO',
                    tiers: [
                        { tierName: 'Starter', availability: 'not_available' },
                        { tierName: 'Pro', availability: 'included' },
                    ],
                },
            ],
        })
        expect(error).toBeUndefined()
    })

    it('fails when name is missing', () => {
        const { error } = schema.validate({
            tiers: [{ name: 'Starter', basePrice: { value: 25 } }],
        })
        expect(error).toBeDefined()
        expect(error.details[0].path).toContain('name')
    })

    it('fails when tiers is empty', () => {
        const { error } = schema.validate({
            name: 'App',
            tiers: [],
        })
        expect(error).toBeDefined()
    })

    it('fails when tiers is missing', () => {
        const { error } = schema.validate({ name: 'App' })
        expect(error).toBeDefined()
    })

    it('fails when tier basePrice.value is missing', () => {
        const { error } = schema.validate({
            name: 'App',
            tiers: [{ name: 'Starter', basePrice: {} }],
        })
        expect(error).toBeDefined()
    })

    it('fails for invalid availability value', () => {
        const { error } = schema.validate({
            name: 'App',
            tiers: [{ name: 'Starter', basePrice: { value: 10 } }],
            features: [
                {
                    name: 'SSO',
                    tiers: [{ tierName: 'Starter', availability: 'maybe' }],
                },
            ],
        })
        expect(error).toBeDefined()
    })

    it('fails for invalid pricingModel value', () => {
        const { error } = schema.validate({
            name: 'App',
            tiers: [{ name: 'Starter', basePrice: { value: 10 } }],
            features: [
                {
                    name: 'SSO',
                    tiers: [{ tierName: 'Starter', availability: 'addon', pricingModel: 'usage' }],
                },
            ],
        })
        expect(error).toBeDefined()
    })

    it('defaults features to empty array', () => {
        const { error, value } = schema.validate({
            name: 'App',
            tiers: [{ name: 'Starter', basePrice: { value: 10 } }],
        })
        expect(error).toBeUndefined()
        expect(value.features).toEqual([])
    })

    it('defaults frequency to monthly', () => {
        const { value } = schema.validate({
            name: 'App',
            tiers: [{ name: 'Starter', basePrice: { value: 10 } }],
        })
        expect(value.tiers[0].basePrice.frequency).toBe('monthly')
    })
})

describe('product validation - updateProduct', () => {
    const schema = productValidation.updateProduct

    it('passes with partial update (name only)', () => {
        const { error } = schema.validate({ name: 'New Name' })
        expect(error).toBeUndefined()
    })

    it('passes with empty object (no fields required)', () => {
        const { error } = schema.validate({})
        expect(error).toBeUndefined()
    })

    it('fails when tiers is empty array', () => {
        const { error } = schema.validate({ tiers: [] })
        expect(error).toBeDefined()
    })
})
