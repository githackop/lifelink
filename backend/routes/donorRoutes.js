import express from 'express';
import { updateAvailability } from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.patch('/availability', protect, authorize('donor'), updateAvailability);

export default router;
