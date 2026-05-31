import express from 'express';
import {
  getHospitalDonors,
  addManualHospitalDonor,
} from '../controllers/hospitalDonorController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('hospital'), getHospitalDonors);

router.post(
  '/manual',
  protect,
  authorize('hospital'),
  addManualHospitalDonor
);

export default router;