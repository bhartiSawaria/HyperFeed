
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');

exports.createPost = (req, res, next) => {
    let newPost = {};
    if(req.body.content){
        newPost['content'] = req.body.content;
    }
    if(req.file){
        newPost['imageUrl'] = req.file.path;
    }

    let currentPost;
    User.findById(req.userId).then(user => {
        newPost['postedBy'] = user;
        const post = new Post(newPost);
        return post.save();
    })
    .then(post => {
        if(post){
            currentPost = post;
            return User.findById(post.postedBy);
        }
    })
    .then(user => {
        const updatedPosts = [...user.posts];
        updatedPosts.push(new mongoose.Types.ObjectId(currentPost._id));
        user.posts = updatedPosts;
        return user.save();
    })
    .then(user => {
        res.status(201).json({message: 'Post saved successfully', post: currentPost});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    })  
}

exports.getFeed = (req, res, next) => {
    let allPosts = [];
    let currentUser;
    User.findById(req.userId).then(user => {
        if(user){
            currentUser = user; 
            return Post.find({postedBy: {$in: [...user.friends, user._id]}}).populate('postedBy').exec();
        }
    }) 
    .then(posts => {
        if(posts){
            let isLiked, isSaved;
            allPosts = posts.map(post => {
                isLiked = post.likedBy.includes(currentUser._id);
                isSaved = post.savedBy.includes(currentUser._id);
                return{
                    ...post._doc,
                    isLiked: isLiked,
                    isSaved: isSaved
                }
            })
            res.status(200).json({message: 'Posts fetched successfully', posts: allPosts})
        }   
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post
    .findById(postId)
    .populate({path: 'comments', populate: ({path: 'postedBy'})})
    .exec()
    .then(post => {
        if(post){
            res.status(200).json({message: 'Post fetched successfully', post: post});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.savePost = (req, res, next) => {
    const postId = req.body.postId;
    if(!postId){
        const error = new Error('Post id is incorrect.');
        throw error;
    }

    Post.findById(postId).then(post => {
        const updatedSavedBy = [...post.savedBy];
        updatedSavedBy.push(new mongoose.Types.ObjectId(req.userId));
        post.savedBy = updatedSavedBy;
        return post.save();
    })
    .then(post => {
        if(post){
            res.status(200).json({message: 'Post saved successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.removeSavedPost = (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.userId;

    Post.findById(postId).then(post => {
        if(post){
            const updatedSavedBy = post.savedBy.filter(user => user._id != userId);
            post.savedBy = updatedSavedBy;
            return post.save();
        }
    })
    .then(post => {
        if(post){
            res.status(201).json({message: 'Post removed successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.likePost = (req, res, next) => {
    const postId = req.body.postId;
    let userName;
    if(!postId){
        const error = new Error('Post id is incorrect.');
        throw error;
    }

    User.findById(req.userId).then(user => {
        if(user){
            userName = user.username;
            return Post.findById(postId);
        }
    })
    .then(post => {
        if(post){
            const updatedLikedBy = [...post.likedBy];
            updatedLikedBy.push(new mongoose.Types.ObjectId(req.userId));
            post.likedBy = updatedLikedBy;
            return post.save();
        }
    })
    .then(post => {
        if(post){
            res.status(200).json({message: 'Post liked successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.unlikePost = (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.userId;

    Post.findById(postId)
    .then(post => {
        if(post){
            const updatedLikedBy = post.likedBy.filter(user => user._id != userId);
            post.likedBy = updatedLikedBy;
            return post.save();
        }
    })
    .then(post => {
        if(post){
            res.status(201).json({message: 'Post unliked successfully'});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.getSavedPosts = (req, res, next) => {
    const userId = req.userId;
    if(!userId){
        const error = new Error('User id invalid.');
        throw error;
    }
    let savedPosts;
             
    Post
    .find()
    .populate('postedBy')
    .exec()
    .then(posts => {
        if(posts){
            let isLiked;
            savedPosts = posts.reduce((acc, post) => {
                if( post.savedBy.includes(userId) ){
                    isLiked = post.likedBy.includes(userId);
                    acc.push({
                        ...post._doc,
                        isLiked: isLiked,
                        isSaved: true
                    })
                }
                return acc;
            }, []);
        }
        res.status(200).json({message: 'Saved posts fetched successfully', posts: savedPosts});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
};

exports.postComment = (req, res, next) => {
    const postId = req.body.postId;
    const commentMessage = req.body.commentInfo.message;

    Post.findById(postId)
    .then(post => {
        if(post){
            var updatedComments = [...post.comments];
            var newComment = {
                message: commentMessage,
                postedBy: req.body.commentInfo.postedBy
            }
            updatedComments.push(newComment);
            post.comments = updatedComments;
            return post.save();
        }
    })
    .then(result => {
        res.status(200).json({message: 'Comment added successfully'});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.body.postId;
    const userId = req.body.userId;

    Post
    .findByIdAndDelete(postId)
    .then(result => {
        return User.findById(userId);
    })
    .then(user => {
        if(user){
            const updatedPosts = user.posts.filter(post => post._id != postId);
            user.posts = updatedPosts;
            return user.save();
        }
    })
    .then(result => {
        res.status(200).json({message: 'Post deleted successfully.'});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    })
}
