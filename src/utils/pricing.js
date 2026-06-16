const TERM_CONFIG = {
    monthly: { multiplier: 1, discount: 0, label: 'Monthly' },
    annual: { multiplier: 12, discount: 15, label: 'Annual (12 months)' },
    two_year: { multiplier: 24, discount: 25, label: '2-Year (24 months)' },
}

function getTermConfig(termLength) {
    return TERM_CONFIG[termLength] || TERM_CONFIG.monthly
}

function computeBaseProductCost(basePrice, seats, termMonths, discountPercent) {
    return seats * basePrice * termMonths * (1 - discountPercent / 100)
}

function computeAddOnCost(addOn, termMonths, baseProductCost) {
    switch (addOn.pricingModel) {
        case 'fixed':
            return addOn.price * termMonths
        case 'per_seat':
            return (addOn.seats || 0) * addOn.price * termMonths
        case 'percentage':
            return (addOn.price / 100) * baseProductCost
        default:
            return 0
    }
}

function computeQuoteLineItems(input) {
    const term = getTermConfig(input.termLength)
    const lineItems = []

    const baseProductCost = computeBaseProductCost(
        input.basePrice,
        input.seats,
        term.multiplier,
        term.discount,
    )

    lineItems.push({
        label: `${input.productName} - ${input.tierName} tier`,
        calculation: `${input.seats} seats × $${input.basePrice} per seat per month × ${term.multiplier} months${term.discount > 0 ? ` × (1 - ${term.discount}% ${term.label.toLowerCase().split(' ')[0]} discount)` : ''}`,
        notes: 'Base product cost',
        amount: baseProductCost,
    })

    let addOnTotal = 0

    for (const addOn of input.addOns) {
        const addOnCost = computeAddOnCost(addOn, term.multiplier, baseProductCost)
        addOnTotal += addOnCost

        let calculation = ''
        let notes = ''

        switch (addOn.pricingModel) {
            case 'fixed':
                calculation = `$${addOn.price} per month × ${term.multiplier} months`
                notes = 'Fixed monthly add-on price'
                break
            case 'per_seat':
                calculation = `${addOn.seats} seats × $${addOn.price} per seat per month × ${term.multiplier} months`
                notes = 'Per-seat add-on'
                break
            case 'percentage':
                calculation = `${addOn.price}% of base product cost ($${baseProductCost.toLocaleString()})`
                notes = 'Percentage of base product cost'
                break
        }

        lineItems.push({
            label: `Add-on: ${addOn.featureName}`,
            calculation,
            notes,
            amount: addOnCost,
        })
    }

    const subtotal = baseProductCost + addOnTotal
    let total = subtotal

    if (input.overallDiscount && input.overallDiscount > 0) {
        const discountAmount = subtotal * (input.overallDiscount / 100)
        lineItems.push({
            label: 'Overall Discount',
            calculation: `${input.overallDiscount}% off subtotal ($${subtotal.toLocaleString()})`,
            notes: 'Applied to entire quote',
            amount: -discountAmount,
        })
        total = subtotal - discountAmount
    }

    return { lineItems, total }
}

module.exports = {
    getTermConfig,
    computeBaseProductCost,
    computeAddOnCost,
    computeQuoteLineItems,
}
