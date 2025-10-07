import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { testAuthLimiter, noRateLimit } from '../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
// Use no rate limiting for development
if (process.env.NODE_ENV === 'development') {
  router.post('/login', noRateLimit, validate(loginSchema), authController.login);
} else {
  router.post('/login', testAuthLimiter, validate(loginSchema), authController.login);
}
router.post('/logout', authenticate, authController.logout);
router.get('/verify-token', authenticate, authController.verifyToken);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;

