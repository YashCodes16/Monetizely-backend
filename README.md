# Monetizely Backend

REST API for Monetizely -- a SaaS pricing and quote generation platform. Manage products with tiered pricing models, configure per-tier feature availability, and generate itemized customer quotes with automatic term discounts.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Joi
- **ID Generation**: nanoid

## Project Structure

```
src/
  app.js                  # Express app setup (middleware, routes, error handler)
  server.js               # Entry point -- connects to MongoDB and starts listening
  config/
    db.js                 # Mongoose connection helper
  models/
    product.model.js      # Product schema (tiers, features, pricing models)
    quote.model.js        # Quote schema (snapshots, line items, totals)
  controllers/
    product.controller.js # CRUD for products and features
    quote.controller.js   # Quote creation, listing, retrieval, deletion
  routes/
    product.routes.js     # /api/products endpoints
    quote.routes.js       # /api/quotes endpoints
  middlewares/
    errorHandler.js       # Global error handler (CastError, ValidationError, duplicates)
    validate.js           # Joi validation middleware
  validations/
    product.validation.js # Joi schemas for product payloads
    quote.validation.js   # Joi schemas for quote payloads
  utils/
    catchAsync.js         # Async route handler wrapper
    pricing.js            # Pricing engine (term discounts, add-on calculations)
```

## API Endpoints

### Products (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (paginated, searchable) |
| POST | `/api/products` | Create a product |
| GET | `/api/products/:id` | Get a product by ID |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| DELETE | `/api/products/:id/features/:featureId` | Remove a feature from a product |

**Query params**: `page` (default 1), `limit` (default 10, max 100), `search` (regex on name)

### Quotes (`/api/quotes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes` | List quotes (paginated) |
| POST | `/api/quotes` | Create a quote |
| GET | `/api/quotes/:slug` | Get a quote by slug |
| DELETE | `/api/quotes/:slug` | Delete a quote by slug |

**Query params**: `page` (default 1), `limit` (default 10, max 100)

## Data Model

### Product

A product has multiple **tiers** (e.g. Starter, Pro, Enterprise), each with a base price per seat per month. **Features** are defined once and mapped across tiers with availability status:

- `included` -- part of the tier at no extra cost
- `addon` -- available as an add-on with a pricing model (`fixed`, `per_seat`, or `percentage`)
- `not_available` -- not offered in that tier

### Quote

A quote snapshots a product's pricing at creation time so it remains accurate even if the product is later modified. Each quote contains:

- Customer and quote metadata
- Selected product, tier, and seat count
- Term length with automatic discounts (15% annual, 25% two-year)
- Optional add-ons calculated per their pricing model
- Optional overall discount
- Itemized line items with human-readable calculation breakdowns
- Computed total

## Pricing Engine

The pricing engine (`src/utils/pricing.js`) handles:

| Term | Months | Auto Discount |
|------|--------|---------------|
| Monthly | 1 | 0% |
| Annual | 12 | 15% |
| Two-Year | 24 | 25% |

**Base cost**: `seats x basePrice x months x (1 - termDiscount%)`

**Add-on costs** (per pricing model):
- **Fixed**: `price x months`
- **Per-seat**: `seats x price x months`
- **Percentage**: `(price / 100) x baseProductCost`

Each line item includes a `calculation` field showing the full formula for transparency.

## Setup

```bash
git clone <repo-url>
cd backend
npm install
```

Create a `.env` file:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/monetizely
PORT=5000
```

Run the dev server:

```bash
npm run dev
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `node --watch src/server.js` | Start dev server with file watching |
| `start` | `node src/server.js` | Start production server |
| `test` | `jest` | Run test suite |
| `test:watch` | `jest --watch` | Run tests in watch mode |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Server port (default: 5000) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: all origins) |
