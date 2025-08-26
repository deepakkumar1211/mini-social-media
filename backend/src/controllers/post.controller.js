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


// Get feed with pagination (update views)
export const getFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username') // owner
        .populate('likes', 'username') // list of users who liked
        .populate('views', 'username') // list of users who viewed
        .populate('comments.user', 'username'); // list of users who commented

    const userId = req.user?._id?.toString();

    if (userId) {
        // collect posts where user hasn't viewed yet
        const unseenPosts = posts.filter(
            p => !p.views.some(v => v._id.toString() === userId)
        );

        if (unseenPosts.length > 0) {
            const bulkOps = unseenPosts.map(p => ({
                updateOne: {
                    filter: { _id: p._id },
                    update: { $push: { views: userId } }
                }
            }));

            await Post.bulkWrite(bulkOps);

            // update local array so viewsCount & viewsList are correct
            unseenPosts.forEach(p => p.views.push({ _id: userId, username: req.user.username }));
        }
    }

    // Prepare response
    const data = posts.map(p => ({
        id: p._id,
        user: p.user,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        caption: p.caption,

        // counts
        likesCount: p.likes.length,
        viewsCount: p.views.length,
        commentsCount: p.comments.length,

        // lists
        likedBy: p.likes.map(u => ({ _id: u._id, username: u.username })),
        viewedBy: p.views.map(u => ({ _id: u._id, username: u.username })),
        comments: p.comments.map(c => ({
            _id: c._id,
            text: c.text,
            createdAt: c.createdAt,
            user: c.user ? { _id: c.user._id, username: c.user.username } : null
        })),

        likedByMe: userId ? p.likes.some(likeUser => likeUser._id.toString() === userId) : false,
        createdAt: p.createdAt
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
