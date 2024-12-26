# Node.js API on Cloudflare Workers

A production-ready Node.js API deployed on Cloudflare Workers with versioned endpoints.

[![Tests](https://github.com/your-username/your-repo/actions/workflows/test.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/test.yml)
[![Deploy](https://github.com/your-username/your-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/your-username/your-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/your-repo)
![GitHub](https://img.shields.io/github/license/your-username/your-repo)

## Prerequisites

- Node.js 18 or later
- Cloudflare account
- Wrangler CLI

## Setup

   Install Wrangler CLI:

```bash
npm install -g wrangler
```

## Project Structure

```bash
nodejs-worker-api/
├── src/
│   └── index.js      # Main application logic
├── package.json      # Project dependencies and scripts
└── wrangler.toml     # Cloudflare Workers configuration
```

## Development

1. Install dependencies:

```bash
npm install
```

1. Run locally

```bash
npm run dev
```

## Deployment

Deploy to different environments:

```bash
# Deploy to production
npm run deploy
```

## API Endpoints

All endpoints are versioned and prefixed with `/api/v1`

### Health Check

- **GET** `/api/v1/status`
  - Returns service health status and environment information
  - No authentication required
  - Response: 200 OK

  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "environment": "production",
      "timestamp": "2024-03-14T12:00:00Z",
      "version": "1.0.0"
    }
  }
  ```

### Messages

- **POST** `/api/v1/messages`
  - Creates a new message
  - Requires JSON payload
  - Response: 201 Created

  ```json
  {
    "success": true,
    "data": {
      "message": "Your message here",
      "timestamp": "2024-03-14T12:00:00Z",
      "id": "uuid-here"
    }
  }
  ```

## Testing

```bash
# Test health check endpoint
curl http://localhost:8787/api/v1/status

# Test message creation
curl -X POST http://localhost:8787/api/v1/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Testing Cloudflare Workers!"}'
```

### Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 400
  }
}
```

Common HTTP status codes:

- 400: Bad Request
- 404: Not Found
- 415: Unsupported Media Type
- 500: Internal Server Error

### Postman Collection

[Cloudflare Workers API](cloudflare-workers-api.postman_collection.json)

### NPM scripts

- `npm run format` - Format all files
- `npm run lint` - Lint all files
- `npm run dev` - Run locally
- `npm run deploy` - Deploy to production
- `npm run start` - Run locally
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Tests

The project uses Vitest for testing. Tests are located in the `test` directory.

### Running Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Coverage reports are generated in the `coverage` directory when running

```bash
npm run test:coverage
```

The coverage report includes

- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Coverage reports are automatically uploaded to [Codecov](https://codecov.io) on each push and pull request.
Current coverage status is reflected in the badge at the top of this README.

#### Coverage Requirements

- Minimum coverage threshold: 80%
- Coverage is checked for:
  - Overall project coverage
  - New code in pull requests
- Failed coverage checks will block merging

## CI/CD

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

#### Test

- Runs on push to main and pull requests
- Executes tests on Node.js 18.x and 20.x
- Runs linter checks
- Generates and uploads test coverage

#### Deploy

- Deploys to production on push to main
- Requires successful tests
- Uses Cloudflare API tokens for deployment

### Environment Setup

Required secrets in GitHub:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CODECOV_TOKEN`: Token from codecov.io for uploading coverage report

To set up:

1. Go to your repository settings
2. Navigate to Secrets and Variables > Actions
3. Add the required secrets

#### Setting up Badges

1. Create a Codecov account and link it to your GitHub repository
2. Get your Codecov token and add it as `CODECOV_TOKEN` secret
3. Create a GitHub personal access token with `gist` scope

### About Miniflare

Miniflare is a simulator for developing and testing Cloudflare Workers ↗. It's written in TypeScript, and runs your code in a sandbox implementing Workers' runtime APIs.

🎉 Fun: develop Workers easily with detailed logging, file watching and pretty error pages supporting source maps.
🔋 Full-featured: supports most Workers features, including KV, Durable Objects, WebSockets, modules and more.
⚡ Fully-local: test and develop Workers without an Internet connection. Reload code on change quickly
