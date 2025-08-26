import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        text: { 
            type: 
            String 
        },
        createdAt: { type: Date, default: Date.now }
    },
    {timestamps: true}
);

const postSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', required: true 
        },
        mediaUrl: { 
            type: String, 
            required: true 
        },
        mediaType: { 
            type: String 
        }, // image/video
        caption: { 
            type: String, 
            default: '' 
        },
        likes: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }
        ],
        views: [
            { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }
        ],
        comments: [
            commentSchema
        ],
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    },
    {timestamps: true}
);

export const Post = mongoose.model('Post', postSchema);
