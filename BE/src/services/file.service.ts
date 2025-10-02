import fs from 'fs';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/apiError';

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error('Failed to delete file:', error);
    throw ApiError.internal('Failed to delete file');
  }
};

export const validateFileSize = (fileSize: number, maxSize: number): void => {
  if (fileSize > maxSize) {
    throw ApiError.badRequest(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
  }
};

export const validateFileType = (mimetype: string, allowedTypes: string[]): void => {
  if (!allowedTypes.includes(mimetype)) {
    throw ApiError.badRequest(`File type ${mimetype} is not allowed`);
  }
};

export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`Directory created: ${dirPath}`);
  }
};

export const getFileMetadata = (filePath: string) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    throw ApiError.notFound('File not found');
  }
};

