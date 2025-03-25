import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    }]
})

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema); 