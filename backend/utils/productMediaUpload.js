import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Accepts images (jpeg/jpg/png/webp) AND videos (mp4/webm/mov)
const productMediaUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max per file (videos can be large)
  },
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|webp/;
    const videoTypes = /mp4|webm|mov|avi/;

    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const mime = file.mimetype;

    const isImage = imageTypes.test(ext) && mime.startsWith("image/");
    const isVideo = videoTypes.test(ext) && mime.startsWith("video/");

    if (isImage || isVideo) {
      return cb(null, true);
    } else {
      cb(new Error("Only image (jpg/png/webp) or video (mp4/webm/mov) files are allowed!"));
    }
  },
});

export default productMediaUpload;
