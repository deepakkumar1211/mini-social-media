import express from 'express';
import { protect, isAdmin } from '../middleware/auth.middleware.js';
import { setRates, getRates, dashboard, listUsers, approvePayout } from '../controllers/admin.controller.js';
import { check } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(protect, isAdmin);

router.post('/rates', [ check('perView').optional().isNumeric(), check('perLike').optional().isNumeric() ], handleValidationErrors, setRates);
router.get('/get-rates', getRates); 
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.post('/payouts/:userId/approve', approvePayout);

export default router;
