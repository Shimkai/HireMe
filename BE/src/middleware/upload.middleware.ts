import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const uploadPath =
      file.fieldname === 'avatar'
        ? path.join(config.upload.path, 'avatars')
        : path.join(config.upload.path, 'resumes');
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // For resumes, only allow PDF
  if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError('Only PDF files are allowed for resumes', 400));
    }
  }
  // For avatars, allow images
  else if (file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only image files are allowed for avatars', 400));
    }
  } else {
    cb(null, true);
  }
};

// Upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize, // 5MB
  },
  fileFilter,
});

