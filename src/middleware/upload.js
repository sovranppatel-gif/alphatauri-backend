// src/middleware/upload.js
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    // Directory might already exist, ignore error
  }
};

// Initialize directory
ensureUploadsDir();

// Multer storage configuration
const storage = multer.memoryStorage(); // Store in memory for processing

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Middleware to compress and save image
export const compressAndSaveImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file uploaded, continue
  }

  try {
    // Ensure directory exists
    await ensureUploadsDir();

    const file = req.file;
    const userId = req.params.id || req.user?._id?.toString() || 'unknown';
    const timestamp = Date.now();
    const filename = `user_${userId}_${timestamp}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Convert image to buffer and compress using sharp
    // Target size: 100-200KB, max dimensions: 500x500
    let compressedBuffer = await sharp(file.buffer)
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    // Check file size
    let fileSizeInKB = compressedBuffer.length / 1024;

    // If still larger than 200KB, compress more aggressively
    if (fileSizeInKB > 200) {
      compressedBuffer = await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 70,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer();
      
      fileSizeInKB = compressedBuffer.length / 1024;
    }

    // If still larger, compress even more
    if (fileSizeInKB > 200) {
      compressedBuffer = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 60,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer();
    }

    // Save compressed image to file
    await fs.writeFile(filepath, compressedBuffer);

    // Store relative path in req.file
    req.file.filename = filename;
    req.file.path = `/uploads/${filename}`;
    req.file.destination = uploadsDir;
    req.file.size = compressedBuffer.length;

    console.log(`✅ Image compressed: ${filename} (${(compressedBuffer.length / 1024).toFixed(2)} KB)`);

    next();
  } catch (error) {
    console.error('Error compressing image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing image: ' + error.message,
    });
  }
};

export default upload;
