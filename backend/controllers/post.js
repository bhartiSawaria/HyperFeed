
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');

exports.createPost = async (req, res, next) => {
    let newPost = {};
    if(req.body.content){
        newPost['content'] = req.body.content;
    }
    if(req.file){
        newPost['imageUrl'] = req.file.path;
    }

    try{
        const postCreator = await User.findById(req.userId);
        newPost['postedBy'] = postCreator;
        const post = new Post(newPost);
        const currentPost = await post.save();

        const updatedPosts = [...postCreator.posts];
        updatedPosts.push(new mongoose.Types.ObjectId(currentPost._id));
        postCreator.posts = updatedPosts;
        await postCreator.save();

        res.status(201).json({
            message: 'Post saved successfully', 
            post: currentPost
        });
    }catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    }  
}

exports.getFeed = async(req, res, next) => {
    try{
        const currentUser = await User.findById(req.userId);
        const posts = await Post.find({
            postedBy: {$in: [...currentUser.friends, currentUser._id]}
        })
        .populate('postedBy')
        .exec();

        let isLiked, isSaved;
        const allPosts = posts.map(post => {
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
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
}

exports.getPost = async(req, res, next) => {
    try{
        const postId = req.params.postId;
        const post = await Post.findById(postId)
        .populate({path: 'comments', populate: ({path: 'postedBy'})})
        .exec();

        res.status(200).json({message: 'Post fetched successfully', post: post});
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
}

exports.savePost = async(req, res, next) => {
    const postId = req.body.postId;
    if(!postId){
        const error = new Error('Post id is incorrect.');
        return next(error);
    }

    try{
        const post = await Post.findById(postId);
        const updatedSavedBy = [...post.savedBy];
        updatedSavedBy.push(new mongoose.Types.ObjectId(req.userId));
        post.savedBy = updatedSavedBy;
        await post.save();

        res.status(201).json({message: 'Post saved successfully'});
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
};

exports.removeSavedPost = async(req, res, next) => {

    try{
        const postId = req.body.postId;
        const userId = req.userId;    
        const post = await Post.findById(postId);

        const updatedSavedBy = post.savedBy.filter(user => user._id != userId);
        post.savedBy = updatedSavedBy;
        await post.save();

        res.status(200).json({message: 'Post removed successfully'});
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
};

exports.likePost = async(req, res, next) => {
    const postId = req.body.postId;
    if(!postId){
        const error = new Error('Post id is incorrect.');
        return next(error);
    }

    try{
        const user = await User.findById(req.userId);
        const userName = user.username;
        const post = await Post.findById(postId);

        const updatedLikedBy = [...post.likedBy];
        updatedLikedBy.push(new mongoose.Types.ObjectId(req.userId));
        post.likedBy = updatedLikedBy;
        await post.save();

        res.status(200).json({message: 'Post liked successfully'});
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
}

exports.unlikePost = async(req, res, next) => {

    try{
        const postId = req.body.postId;
        const userId = req.userId;
        const post = await Post.findById(postId);

        const updatedLikedBy = post.likedBy.filter(user => user._id != userId);
        post.likedBy = updatedLikedBy;
        await post.save();

        res.status(200).json({message: 'Post unliked successfully'});
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
};

exports.getSavedPosts = async(req, res, next) => {
    const userId = req.userId;
    if(!userId){
        const error = new Error('User id invalid.');
        return next(error);
    }
        
    try{
        const posts = await Post.find().populate('postedBy').exec();
        let isLiked;
        const savedPosts = posts.reduce((acc, post) => {
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

        res.status(200).json({
            message: 'Saved posts fetched successfully', 
            posts: savedPosts
        });
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
};

exports.postComment = async(req, res, next) => {

    try{
        const postId = req.body.postId;
        const commentMessage = req.body.commentInfo.message;
        const post = await Post.findById(postId);
        let updatedComments = [...post.comments];
        let newComment = {
            message: commentMessage,
            postedBy: req.body.commentInfo.postedBy
        }
        updatedComments.push(newComment);
        post.comments = updatedComments;
        await post.save();

        res.status(200).json({ message: 'Comment added successfully' });
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
}

exports.deletePost = async(req, res, next) => {
    try{
        const postId = req.body.postId;
        const userId = req.body.userId;
        await Post.findByIdAndDelete(postId);

        const user = await User.findById(userId);
        const updatedPosts = user.posts.filter(post => post._id != postId);
        user.posts = updatedPosts;
        await user.save();

        res.status(200).json({message: 'Post deleted successfully.'});
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);  
    }
}