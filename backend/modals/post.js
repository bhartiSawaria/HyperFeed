
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    content: {
        type: String
    },
    imageUrl: {
        type: String
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    savedBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [{
        message: String,
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        postedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true } );

module.exports = mongoose.model('Post', postSchema);