import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const formatted = errors.array().map(e => ({ field: e.param, message: e.msg }));
    return res.status(400).json({ success: false, errors: formatted });
};
