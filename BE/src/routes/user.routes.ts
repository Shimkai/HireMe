import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileSchema, verifyStudentSchema } from '../validators/user.validator';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);

// TnP routes
router.get('/students', authenticate, authorizeRoles('TnP'), userController.getStudents);
router.put('/students/:id/verify', authenticate, authorizeRoles('TnP'), validate(verifyStudentSchema), userController.verifyStudent);
router.delete('/students/:id', authenticate, authorizeRoles('TnP'), userController.deleteStudent);

export default router;

