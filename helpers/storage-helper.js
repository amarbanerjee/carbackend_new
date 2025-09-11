const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "text/csv"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported File Type"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter,
});

// Accept specific fields
exports.uploadFields = (fields) => (req, res, next) => {
  const uploader = upload.fields(fields);
  uploader(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: `Upload failed: ${error.message}`,
        error: error.code,
      });
    }
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    next();
  });
};
