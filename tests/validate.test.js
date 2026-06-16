const validate = require('../src/middlewares/validate')
const Joi = require('joi')

function mockReqResNext(body = {}) {
    const req = { body }
    const res = {
        statusCode: null,
        body: null,
        status(code) { this.statusCode = code; return this },
        json(data) { this.body = data; return this },
    }
    const next = jest.fn()
    return { req, res, next }
}

describe('validate middleware', () => {
    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(0),
    })

    it('calls next() when body is valid', () => {
        const { req, res, next } = mockReqResNext({ name: 'Alice', age: 30 })
        validate(schema)(req, res, next)
        expect(next).toHaveBeenCalled()
    })

    it('sets req.body to validated (stripped) value', () => {
        const { req, res, next } = mockReqResNext({ name: 'Alice', age: 30, extra: true })
        validate(schema)(req, res, next)
        expect(req.body).toEqual({ name: 'Alice', age: 30 })
        expect(req.body.extra).toBeUndefined()
    })

    it('returns 400 when required field is missing', () => {
        const { req, res, next } = mockReqResNext({ age: 25 })
        validate(schema)(req, res, next)
        expect(res.statusCode).toBe(400)
        expect(res.body.error).toBeDefined()
        expect(next).not.toHaveBeenCalled()
    })

    it('returns 400 with combined message for multiple errors', () => {
        const strictSchema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
        })
        const { req, res, next } = mockReqResNext({})
        validate(strictSchema)(req, res, next)
        expect(res.statusCode).toBe(400)
        expect(res.body.error).toContain('name')
        expect(res.body.error).toContain('email')
    })

    it('returns 400 for invalid field type', () => {
        const { req, res, next } = mockReqResNext({ name: 'Alice', age: 'not-a-number' })
        validate(schema)(req, res, next)
        expect(res.statusCode).toBe(400)
        expect(next).not.toHaveBeenCalled()
    })
})
