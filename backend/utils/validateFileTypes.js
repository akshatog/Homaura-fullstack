import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_MIMES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

/**
 * Express middleware factory that validates uploaded file buffers against their
 * actual magic bytes rather than the client-supplied Content-Type header.
 * Prevents MIME-type spoofing (e.g. an .exe renamed to .jpg).
 *
 * Place this AFTER the multer middleware so req.files is already populated.
 *
 * @param {{ allowVideos?: boolean }} options
 */
const validateFileTypes = ({ allowVideos = false } = {}) =>
  async (req, res, next) => {
    if (!req.files) return next();

    const allFiles = Object.values(req.files).flat();
    if (allFiles.length === 0) return next();

    for (const file of allFiles) {
      const detected = await fileTypeFromBuffer(file.buffer);

      if (!detected) {
        return res.status(400).json({
          error: `Cannot determine file type for "${file.originalname}". Only images${allowVideos ? ' and videos' : ''} are accepted.`,
        });
      }

      const isImage = ALLOWED_IMAGE_MIMES.has(detected.mime);
      const isVideo = allowVideos && ALLOWED_VIDEO_MIMES.has(detected.mime);

      if (!isImage && !isVideo) {
        return res.status(400).json({
          error: `"${file.originalname}" is not an accepted file type (detected: ${detected.mime}). Accepted: JPEG, PNG, WebP${allowVideos ? ', MP4, WebM, MOV' : ''}.`,
        });
      }
    }

    next();
  };

export default validateFileTypes;
