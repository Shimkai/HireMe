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

// This export is required to make this a module
export {};
