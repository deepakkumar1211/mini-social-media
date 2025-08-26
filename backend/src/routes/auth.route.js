import express from 'express';
import { check } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post(
    '/register',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('email').isEmail().withMessage('Valid email required'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    handleValidationErrors,
    register
);

router.post(
    '/login',
    [
        check('email').isEmail().withMessage('Valid email required'),
        check('password').exists().withMessage('Password is required')
    ],
    handleValidationErrors,
    login
);

export default router;
