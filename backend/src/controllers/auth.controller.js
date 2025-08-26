import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// register
export const register = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, role: role || 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: { id: user._id, username: user.username, email: user.email, role: user.role }, token }
    });
});


// login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user: { id: user._id, username: user.username, email: user.email, role: user.role }, token }
    });
});
