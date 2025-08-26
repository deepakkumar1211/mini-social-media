import express from 'express';
import multer from 'multer';
import { check } from 'express-validator';

import {
    createPost,
    getFeed,
    getPost,
    toggleLike,
    addComment
} from '../controllers/post.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validate.middleware.js';

const router = express.Router();

// multer memory storage -> buffer
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// create post
router.post(
    '/',
    protect,
    upload.single('media'),
    [ check('caption').optional().isLength({ max: 500 }).withMessage('Caption max 500 characters') ],
    handleValidationErrors,
    createPost
);

router.get('/', protect, getFeed);
router.get('/:id', protect, getPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, [ check('text').notEmpty().withMessage('Comment cannot be empty') ], handleValidationErrors, addComment);

export default router;
