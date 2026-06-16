const {
    getTermConfig,
    computeBaseProductCost,
    computeAddOnCost,
    computeQuoteLineItems,
} = require('../src/utils/pricing')

describe('getTermConfig', () => {
    it('returns monthly config by default', () => {
        const config = getTermConfig('monthly')
        expect(config).toEqual({ multiplier: 1, discount: 0, label: 'Monthly' })
    })

    it('returns annual config with 15% discount', () => {
        const config = getTermConfig('annual')
        expect(config.multiplier).toBe(12)
        expect(config.discount).toBe(15)
    })

    it('returns two_year config with 25% discount', () => {
        const config = getTermConfig('two_year')
        expect(config.multiplier).toBe(24)
        expect(config.discount).toBe(25)
    })

    it('falls back to monthly for unknown term', () => {
        const config = getTermConfig('weekly')
        expect(config).toEqual({ multiplier: 1, discount: 0, label: 'Monthly' })
    })
})

describe('computeBaseProductCost', () => {
    it('computes cost with no discount', () => {
        expect(computeBaseProductCost(50, 10, 1, 0)).toBe(500)
    })

    it('computes cost with 15% annual discount', () => {
        // 10 seats * $50 * 12 months * 0.85
        expect(computeBaseProductCost(50, 10, 12, 15)).toBe(5100)
    })

    it('computes cost with 25% two-year discount', () => {
        // 10 seats * $50 * 24 months * 0.75
        expect(computeBaseProductCost(50, 10, 24, 25)).toBe(9000)
    })

    it('returns 0 for 0 seats', () => {
        expect(computeBaseProductCost(50, 0, 12, 15)).toBe(0)
    })

    it('returns 0 for 0 price', () => {
        expect(computeBaseProductCost(0, 10, 12, 15)).toBe(0)
    })
})

describe('computeAddOnCost', () => {
    it('computes fixed add-on cost', () => {
        const cost = computeAddOnCost(
            { featureName: 'SSO', pricingModel: 'fixed', price: 200 },
            12,
            5000,
        )
        expect(cost).toBe(2400)
    })

    it('computes per_seat add-on cost', () => {
        const cost = computeAddOnCost(
            { featureName: 'API', pricingModel: 'per_seat', price: 10, seats: 5 },
            12,
            5000,
        )
        expect(cost).toBe(600)
    })

    it('returns 0 for per_seat add-on with no seats', () => {
        const cost = computeAddOnCost(
            { featureName: 'API', pricingModel: 'per_seat', price: 10 },
            12,
            5000,
        )
        expect(cost).toBe(0)
    })

    it('computes percentage add-on cost', () => {
        const cost = computeAddOnCost(
            { featureName: 'Support', pricingModel: 'percentage', price: 20 },
            12,
            5000,
        )
        expect(cost).toBe(1000)
    })

    it('returns 0 for unknown pricing model', () => {
        const cost = computeAddOnCost(
            { featureName: 'X', pricingModel: 'unknown', price: 100 },
            12,
            5000,
        )
        expect(cost).toBe(0)
    })
})

describe('computeQuoteLineItems', () => {
    it('computes a basic quote with no add-ons', () => {
        const result = computeQuoteLineItems({
            productName: 'App',
            tierName: 'Starter',
            basePrice: 25,
            seats: 10,
            termLength: 'monthly',
            addOns: [],
        })

        expect(result.lineItems).toHaveLength(1)
        expect(result.lineItems[0].amount).toBe(250)
        expect(result.total).toBe(250)
    })

    it('computes quote with mixed add-ons', () => {
        const result = computeQuoteLineItems({
            productName: 'Analytics',
            tierName: 'Growth',
            basePrice: 50,
            seats: 25,
            termLength: 'annual',
            addOns: [
                { featureName: 'SSO', pricingModel: 'fixed', price: 200 },
                { featureName: 'API', pricingModel: 'per_seat', price: 10, seats: 5 },
                { featureName: 'Support', pricingModel: 'percentage', price: 20 },
            ],
        })

        expect(result.lineItems).toHaveLength(4)
        expect(result.lineItems[0].amount).toBe(12750) // base
        expect(result.lineItems[1].amount).toBe(2400)  // SSO
        expect(result.lineItems[2].amount).toBe(600)   // API
        expect(result.lineItems[3].amount).toBe(2550)  // Support
        expect(result.total).toBe(18300)
    })

    it('applies overall discount correctly', () => {
        const result = computeQuoteLineItems({
            productName: 'App',
            tierName: 'Pro',
            basePrice: 100,
            seats: 5,
            termLength: 'monthly',
            addOns: [],
            overallDiscount: 10,
        })

        // Base: 5 * 100 * 1 = 500
        // Discount: 10% of 500 = 50
        expect(result.lineItems).toHaveLength(2)
        expect(result.lineItems[1].label).toBe('Overall Discount')
        expect(result.lineItems[1].amount).toBe(-50)
        expect(result.total).toBe(450)
    })

    it('does not add discount line item when discount is 0', () => {
        const result = computeQuoteLineItems({
            productName: 'App',
            tierName: 'Pro',
            basePrice: 100,
            seats: 5,
            termLength: 'monthly',
            addOns: [],
            overallDiscount: 0,
        })

        expect(result.lineItems).toHaveLength(1)
        expect(result.total).toBe(500)
    })

    it('includes calculation strings in line items', () => {
        const result = computeQuoteLineItems({
            productName: 'App',
            tierName: 'Growth',
            basePrice: 50,
            seats: 10,
            termLength: 'annual',
            addOns: [
                { featureName: 'SSO', pricingModel: 'fixed', price: 200 },
                { featureName: 'API', pricingModel: 'per_seat', price: 10, seats: 3 },
                { featureName: 'Support', pricingModel: 'percentage', price: 15 },
            ],
        })

        expect(result.lineItems[0].calculation).toContain('10 seats')
        expect(result.lineItems[0].calculation).toContain('$50 per seat per month')
        expect(result.lineItems[1].calculation).toContain('$200 per month')
        expect(result.lineItems[2].calculation).toContain('3 seats')
        expect(result.lineItems[3].calculation).toContain('15%')
    })

    it('labels line items correctly', () => {
        const result = computeQuoteLineItems({
            productName: 'Analytics',
            tierName: 'Pro',
            basePrice: 50,
            seats: 5,
            termLength: 'monthly',
            addOns: [
                { featureName: 'SSO Integration', pricingModel: 'fixed', price: 100 },
            ],
        })

        expect(result.lineItems[0].label).toBe('Analytics - Pro tier')
        expect(result.lineItems[1].label).toBe('Add-on: SSO Integration')
    })
})
