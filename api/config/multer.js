const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// modulo responsavel por formatar e importar imagens para /tpm/uploads (foto de perfil)
module.exports = {
  dest: path.resolve(__dirname, "..", "tmp", "uploads"),
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "tmp", "uploads"));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) {
          cb(err);
        }
        const fileName = `${hash.toString("hex")}-${file.originalname
          .replaceAll(/\s/g, "")
          .replaceAll(/[^0-9a-zA-Z.]/g, "")}`;
        cb(null, fileName);
      });
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("file not valid"));
    }
  },
};