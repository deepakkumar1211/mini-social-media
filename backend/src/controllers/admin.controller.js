// src/controllers/adminController.js
import {Post} from '../models/Post.model.js';
import {Rate} from '../models/Rate.model.js';
import {User} from '../models/User.model.js';
import {Payout} from '../models/Payout.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';


// Set Rates
export const setRates = asyncHandler(async (req, res) => {
    const { perView, perLike, perComment } = req.body;

    let rate = await Rate.findOne();
    if (!rate) {
        
        rate = new Rate({
            perView: perView ?? 0,
            perLike: perLike ?? 0,
            perComment: perComment ?? 0
        });
    } else {

        rate.perView = perView ?? rate.perView;
        rate.perLike = perLike ?? rate.perLike;
        rate.perComment = perComment ?? rate.perComment;
    }

    await rate.save();

    res.json({ 
        success: true, 
        message: 'Rates updated successfully', 
        data: rate 
    });
});



// Admin dashboard 
export const dashboard = asyncHandler(async (req, res) => {
    const rate = (await Rate.findOne()) || { perView: 0, perLike: 0 };
    const posts = await Post.find().populate('user', 'username email');

    let totals = { totalViews: 0, totalLikes: 0, totalComments: 0, totalEarnings: 0 };
    const postsReport = posts.map(p => {
        const views = p.views.length;
        const likes = p.likes.length;
        const comments = p.comments.length;
        const earning = views * rate.perView + likes * rate.perLike;
        totals.totalViews += views;
        totals.totalLikes += likes;
        totals.totalComments += comments;
        totals.totalEarnings += earning;
        return {
        postId: p._id,
        user: p.user,
        mediaUrl: p.mediaUrl,
        views,
        likes,
        comments,
        earning
        };
    });

    res.json({ success: true, data: { totals, posts: postsReport } });
});



// List users with their payable amounts (simple computation)
export const listUsers = asyncHandler(async (req, res) => {
    const rate = (await Rate.findOne()) || { perView: 0, perLike: 0 };
    const users = await User.find().select('-password');

  // compute payable for each user
    const report = await Promise.all(users.map(async user => {
        const userPosts = await Post.find({ user: user._id });
        const payable = userPosts.reduce((sum, p) => {
        return sum + (p.views.length * rate.perView) + (p.likes.length * rate.perLike);
        }, 0);
        const alreadyPaid = await Payout.aggregate([
        { $match: { user: user._id, approved: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const paid = (alreadyPaid[0] && alreadyPaid[0].total) || 0;
        const pending = Math.max(0, payable - paid);
        return { user, payable, paid, pending };
    }));

    res.json({ success: true, data: report });
});


// Approve payout for a user (creates a payout record with current pending amount)
export const approvePayout = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const rate = (await Rate.findOne()) || { perView: 0, perLike: 0 };

    const userPosts = await Post.find({ user: userId });
    const payable = userPosts.reduce((sum, p) => {
        return sum + (p.views.length * rate.perView) + (p.likes.length * rate.perLike);
    }, 0);

    const alreadyPaidAgg = await Payout.aggregate([
        { $match: { user: new require('mongoose').Types.ObjectId(userId), approved: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const paid = (alreadyPaidAgg[0] && alreadyPaidAgg[0].total) || 0;
    const pending = Math.max(0, payable - paid);
    if (pending <= 0) return res.status(400).json({ success: false, message: 'No pending payable amount' });

    const payout = new Payout({ user: userId, amount: pending, approved: true, approvedAt: new Date() });
    await payout.save();

    res.json({ success: true, message: 'Payout approved', data: payout });
});



// get rates 
export const getRates = asyncHandler(async (req, res) => {
    let rate = await Rate.findOne();

    if (!rate) {
        // If no rates exist, return defaults
        rate = new Rate({
            perView: 0.01,
            perLike: 0.05,
            perComment: 0.1
        });
        await rate.save();
    }

    res.json({
        success: true,
        message: "Rates fetched successfully",
        data: rate
    });
});
