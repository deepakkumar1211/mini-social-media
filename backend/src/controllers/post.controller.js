import {Post} from '../models/Post.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../config/cloudinary.js';


// Create post (media upload via multer memoryStorage -> req.file.buffer)
    export const createPost = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Media file is required' });

    // upload to cloudinary
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'posts');

    const post = new Post({
        user: req.user._id,
        mediaUrl: uploadResult.secure_url,
        mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        caption: req.body.caption || ''
    });

    await post.save();

    res.status(201).json({ success: true, message: 'Post created', data: post });
});


// Get feed with pagination
export const getFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username');

    const userId = req.user?._id?.toString(); // logged-in user

    const data = posts.map(p => ({
        id: p._id,
        user: p.user,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        caption: p.caption,
        likesCount: p.likes.length,
        viewsCount: p.views.length,
        commentsCount: p.comments.length,
        createdAt: p.createdAt,
        likedByMe: userId ? p.likes.some(likeId => likeId.toString() === userId) : false
    }));

    res.json({ success: true, data });
});



// Get single post — also register view if user provided
export const getPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('user', 'username');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // track view (if user present in req.user)
    if (req.user) {
        const alreadyViewed = post.views.some(v => v.toString() === req.user._id.toString());
        if (!alreadyViewed) {
        post.views.push(req.user._id);
        await post.save();
        }
    }

    res.json({
        success: true,
        data: {
        id: post._id,
        user: post.user,
        mediaUrl: post.mediaUrl,
        caption: post.caption,
        likesCount: post.likes.length,
        viewsCount: post.views.length,
        comments: post.comments
        }
    });
});


//  Like/unlike post (toggle)
export const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const idx = post.likes.findIndex(u => u.toString() === userId);
    if (idx === -1) {
        post.likes.push(req.user._id);
        await post.save();
        return res.json({ success: true, message: 'Post liked', likesCount: post.likes.length });
    } else {
        post.likes.splice(idx, 1);
        await post.save();
        return res.json({ success: true, message: 'Post unliked', likesCount: post.likes.length });
    }
});


// Comment on post
export const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();

    res.status(201).json({ success: true, message: 'Comment added', commentsCount: post.comments.length });
});
