# Mad3oom REST API (v1)

Professional REST API for the Mad3oom Support Platform, designed for scalability and multi-tenant isolation.

## 🚀 Features

- **Multi-tenant Isolation**: Strict data isolation enforced via Sequelize Scopes and Middlewares.
- **Secure API Keys**: Hashed storage (SHA-256) with single-view display for production-grade security.
- **Advanced Webhooks**: Queue-based delivery (BullMQ/Redis) with exponential backoff retry system and Dead Letter Queue (DLQ).
- **Idempotency**: Support for `Idempotency-Key` header to prevent duplicate operations.
- **Audit Trail**: Comprehensive logging of all actions (Create, Update, Delete) with old/new data snapshots.
- **RS256 JWT**: Enhanced security using Public/Private key pairs for manager authentication.
- **Soft Delete**: Paranoid mode enabled for data recovery and audit compliance.
- **Production Rate Limiting**: Redis-backed rate limiting applied per API Key/Manager.

## 🛠 Tech Stack

- **Node.js & Express**
- **Sequelize (ORM)** with **Supabase (PostgreSQL)**.
- **Vercel Ready**: Optimized for deployment on Vercel as Serverless Functions.
- **Swagger UI** for API documentation.
- **Axios** for Webhook delivery.

## 🏁 Getting Started

### 1. Installation

```bash
pnpm install
```

### 2. Configuration

Create a `.env` file based on the provided example:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=your_shared_jwt_secret_with_mad3oom_online
API_KEY_SECRET=mad3oom_api_key_salt
WEBHOOK_SECRET=mad3oom_webhook_secret
```

### 3. Running the Server

```bash
# Development mode
pnpm run dev

# Production mode
pnpm start
```

## 📖 API Documentation

Once the server is running, visit:
`http://localhost:3000/api/docs` or `https://api.mad3oom.online/api/docs`

## 🔗 Integration with mad3oom.online

This API expects a JWT token issued by `mad3oom.online` for administrative tasks (like managing API keys). The token must contain a `managerId` claim.

- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`
- **API Consumption Header**: `x-api-key: <YOUR_API_KEY>`

## 📝 Example: Create a Ticket via API

```bash
curl -X POST https://api.mad3oom.online/api/v1/tickets \
  -H "x-api-key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "System Outage",
    "description": "Users are unable to access the dashboard",
    "priority": "high"
  }'
```

---
Designed for **Mad3oom Support Platform**.
