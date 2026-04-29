const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mad3oom API Documentation",
      version: "1.0.0",
      description: "Professional REST API for Mad3oom Support Platform",
      contact: {
        name: "Mad3oom Support",
        url: "https://mad3oom.online",
      },
    },
    servers: [
      {
        url: "https://api.mad3oom.online/api/v1",
        description: "Production Server",
      },
      {
        url: "http://localhost:3000/api/v1",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API Key for consumer authentication",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Manager JWT token for administrative tasks",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;
