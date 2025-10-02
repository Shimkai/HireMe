import { Router } from 'express';
import * as collegeController from '../controllers/college.controller';

const router = Router();

router.get('/', collegeController.getAllColleges);

export default router;

