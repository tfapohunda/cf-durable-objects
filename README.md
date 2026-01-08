# Durable Object Starter

A Cloudflare Workers starter project demonstrating Durable Objects - stateful, globally distributed objects that provide strongly consistent storage and coordination.

## Overview

This project implements a counter service using Cloudflare Durable Objects. Each counter instance maintains persistent state across requests, allowing you to create multiple independent counters identified by name.

## Features

- **Stateful Counters**: Create and manage multiple named counter instances
- **Persistent Storage**: Counter values persist across requests using Durable Object storage
- **RESTful API**: Simple HTTP endpoints for incrementing, decrementing, and reading counter values
- **TypeScript**: Full TypeScript support with type safety

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Cloudflare account (for deployment)

## Installation

1. Install dependencies:

```bash
npm install
```

1. Generate TypeScript types for Cloudflare bindings:

```bash
npm run cf-typegen
```

## Development

Start the local development server:

```bash
npm run dev
```

The server will start at `http://localhost:8787` (or another port if 8787 is in use).

## API Usage

All endpoints require a `name` query parameter to identify which Durable Object instance to use.

### Get Counter Value

Returns the current value of the counter.

```bash
GET /?name=<counter-name>
```

**Example:**

```bash
curl "http://localhost:8787/?name=myCounter"
```

**Response:**

```
Durable Object 'myCounter' count: 0
```

### Increment Counter

Increments the counter by 1 (default) or by a specified amount.

```bash
POST /incr?name=<counter-name>
```

**Increment by 1:**

```bash
curl -X POST "http://localhost:8787/incr?name=myCounter"
```

**Increment by custom amount:**

```bash
curl -X POST "http://localhost:8787/incr?name=myCounter" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}'
```

### Decrement Counter

Decrements the counter by 1 (default) or by a specified amount.

```bash
POST /decr?name=<counter-name>
```

**Decrement by 1:**

```bash
curl -X POST "http://localhost:8787/decr?name=myCounter"
```

**Decrement by custom amount:**

```bash
curl -X POST "http://localhost:8787/decr?name=myCounter" \
  -H "Content-Type: application/json" \
  -d '{"amount": 3}'
```

## Project Structure

```
.
├── src/
│   └── index.ts          # Main worker and Durable Object classes
├── wrangler.jsonc        # Wrangler configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Durable Objects

The project defines two Durable Object classes:

### `Counter`

The active counter implementation with the following methods:

- `getCounterValue()`: Returns the current counter value
- `increment(amount)`: Increments the counter by the specified amount (default: 1)
- `decrement(amount)`: Decrements the counter by the specified amount (default: 1)

### `MyDurableObject`

An example Durable Object class with a `sayHello()` method (currently not used in the API).

## Configuration

Durable Object bindings are configured in `wrangler.jsonc`:

- `COUNTER_DURABLE_OBJECT`: Binding for the `Counter` class
- `MY_DURABLE_OBJECT`: Binding for the `MyDurableObject` class

## Deployment

1. Login to Cloudflare (if not already logged in):

```bash
wrangler login
```

1. Deploy the worker:

```bash
npm run deploy
```

## Scripts

- `npm run dev` - Start the development server
- `npm start` - Alias for `npm run dev`
- `npm run deploy` - Deploy to Cloudflare
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## Learn More

- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)

## License

This is a starter template project.
