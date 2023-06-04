/* eslint-disable @typescript-eslint/no-var-requires */
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only CSV and Excel are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

exports.uploadExamFile = upload.single("file");
