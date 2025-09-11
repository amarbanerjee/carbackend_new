// Mount Routes
exports.mountRoutes = (app) => {
  // Swagger setup
  const swaggerDocs = require("../utilities/swagger");
  const swaggerUi = require("swagger-ui-express");
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Routes order
  const authRoute = require("./auth-route");
  const listingRoute = require("./listing-route");
  const bidingRoute = require("./bids-route");

  // Mount in desired order
  app.use("/auth", authRoute);
  app.use("/listing", listingRoute);
  app.use("/bids", bidingRoute);
};
