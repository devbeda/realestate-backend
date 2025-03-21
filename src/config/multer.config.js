import multer from "multer";
import path from "path"
import fs from "fs"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+ path.extname (file.originalname));
  },
});

export const upload = multer({ storage });