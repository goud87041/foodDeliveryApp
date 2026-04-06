import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const uploadRoot = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

/** POST multipart field name: image */
router.post("/image", protectAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file received" });
    }
    const publicPath = `/uploads/${req.file.filename}`;
    res.status(201).json({ success: true, url: publicPath });
  });
});

export default router;
