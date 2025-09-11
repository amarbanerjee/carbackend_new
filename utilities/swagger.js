const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const {
  _appProtocol,
  _appPort,
  _appUrl,
  _projectName,
} = require("./settingsConfig");




const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: _projectName || "Car API",
      version: "1.0.0",
      description: "This is a Swagger Documentation",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token like: Bearer <token>",
        },
      },
    },
    security: [
      { bearerAuth: [] },
    ],
     tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Listings", description: "Car Listings APIs" },
      { name: "Bids", description: "Bidding APIs" },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsdoc(swaggerOptions);
