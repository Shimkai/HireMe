import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roleCheck.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateProfileSchema, verifyStudentSchema } from '../validators/user.validator';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.put('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/upload-avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);
router.post('/upload-tenth-marksheet', authenticate, upload.single('marksheet'), userController.uploadTenthMarksheet);
router.post('/upload-twelfth-marksheet', authenticate, upload.single('marksheet'), userController.uploadTwelfthMarksheet);
router.post('/upload-last-semester-marksheet', authenticate, upload.single('marksheet'), userController.uploadLastSemesterMarksheet);

// TnP routes
router.get('/students', authenticate, authorizeRoles('TnP'), userController.getStudents);
router.put('/students/:id/verify', authenticate, authorizeRoles('TnP'), validate(verifyStudentSchema), userController.verifyStudent);
router.delete('/students/:id', authenticate, authorizeRoles('TnP'), userController.deleteStudent);

export default router;

