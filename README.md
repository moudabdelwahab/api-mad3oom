# Mad3oom REST API (v1)

Professional REST API for the Mad3oom Support Platform, designed for scalability and multi-tenant isolation.

## 🚀 Features

- **Multi-tenant Isolation**: Each manager from `mad3oom.online` has their own isolated data space.
- **API Key Management**: Managers can create, update, and delete multiple API Keys with specific permissions (Read, Create, Update).
- **Ticket System**: Full CRUD operations for support tickets.
- **Webhooks**: Real-time notifications for ticket events (`ticket.created`, `ticket.updated`) with HMAC signing for security.
- **Security**: 
  - Rate Limiting
  - Helmet for security headers
  - API Key and Bearer Token authentication
  - Data validation and sanitization
- **Documentation**: Interactive Swagger documentation at `/api/docs`.

## 🛠 Tech Stack

- **Node.js & Express**
- **Sequelize (ORM)** with SQLite (default) or any SQL database.
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
DB_STORAGE=./database.sqlite
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
