import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema({
    perView: { 
        type: Number, 
        default: 0.5 
    },
    perLike: { 
        type: Number, 
        default: 0.7
    },
    perComment: { 
        type: Number, 
        default: 0.6
    },
}, { timestamps: true });

export const Rate = mongoose.model('Rate', rateSchema);
