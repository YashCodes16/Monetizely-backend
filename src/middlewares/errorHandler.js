function errorHandler(err, req, res, _next) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` })
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ error: messages.join(', ') })
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(409).json({ error: `Duplicate value for ${field}` })
    }

    res.status(500).json({ error: err.message || 'Internal server error' })
}

module.exports = errorHandler
