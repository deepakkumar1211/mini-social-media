import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        approved: { 
            type: Boolean, 
            default: false 
        },
        approvedAt: Date,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }
);

export const Payout = mongoose.model('Payout', payoutSchema);
