import { TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

// Ensure this file is treated as a module
export {};

