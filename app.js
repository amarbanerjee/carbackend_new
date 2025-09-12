require("dotenv").config();
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Initialize Settings Test test code pipelien
const Settings = require("./utilities/settingsConfig");

// Database and Associations
const DatabaseAssociations = require("./database/database-relations");

// Routes
const { mountRoutes } = require("./routes/routes");

// Error Handler
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
}

// Express App
const app = express();

// Middlewares
app.use(compression());
app.set("trust proxy", true);
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logStream = fs.createWriteStream(path.join(logDir, "access.log"), { flags: "a" });
app.use(morgan(
  (tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, "content-length"), "-",
    tokens["response-time"](req, res), "ms",
    JSON.stringify(req.body)
  ].join(" "), 
  { stream: logStream }
));

// Start Server Function
async function startServer() {
  try {
    // Initialize Settings
    await Settings.init();
    const { _projectName, _isLambdaEnvironment, _appProtocol, _appPort, _appUrl } = Settings;

    // Initialize Database
    await DatabaseAssociations.initializeAssociations();

    // Mount Routes
    await mountRoutes(app);

    // Default Route
    app.get("/", (req, res) => {
      res.status(200).send(`<center><h1>${_projectName}</h1></center>`);
    });

    // Global Error Handler
    app.use(errorHandler);

    // Start HTTP Server if not Lambda
    if (!_isLambdaEnvironment) {
      const server = http.createServer(app);
      server.listen(_appPort, () => {
        console.log(`✅ Server started at ${_appProtocol}://${_appUrl}:${_appPort}`);
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.error(`⚠️ Port ${_appPort} is already in use. Change the port or free it.`);
        } else {
          console.error("⚠️ Server failed to start:", err);
        }
      });
    }

    return app; // Exported for Lambda
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
}

// Launch server
(async () => {
  await startServer();
})();

module.exports = app;
