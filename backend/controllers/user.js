
const { validationResult } = require('express-validator/check');

const User = require('../models/user');
const Post = require('../models/post');

exports.getProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.userId)
        .populate('posts')
        .populate('friends')
        .exec();

        res.status(200).json({message: 'User info fetched successfully.', user: user});
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = err.status || 500;    
        next(error);
    };
}

exports.postEditAccount = async (req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        const err = new Error('Editing failed!');
        err.data = errors.array(); 
        console.log('Error occured in postEditAccount', errors);
        throw err;
    }

    try{
        const userId = req.userId;
        const user = await User.findById(userId)
        .populate('posts')
        .populate('friends')
        .exec();

        user.name = req.body.name;
        user.username = req.body.username;
        user.email = req.body.email;
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Account info updated successfully.', 
            user: updatedUser
        });
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = err.status || 500;    
        next(error);
    }
}

exports.getPosts = async(req, res, next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        const posts = await Post.find({_id: {$in: user.posts}}).populate('postedBy')
        let isLiked, isSaved;
        const updatedPosts = posts.map(post => {
            isLiked = post.likedBy.includes(userId);
            isSaved = post.savedBy.includes(userId);
            return{
                ...post._doc,
                isLiked: isLiked,
                isSaved: isSaved
            }
        });
        res.status(200).json({message: 'Posts fetched successfully', posts: updatedPosts})

    }catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try{
        const user = await User.findById(req.userId);
        const users = await User.find({_id: {$nin: [...user.friends, user._id]}});
        res.status(200).json({
            message: 'Users successfully fetched from database.', 
            users: users
        });
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    }
}

exports.changeProfilePic = async(req, res, next) => {
    const userId = req.userId;
    const image = req.file;
    let imageUrl;
    if(image){
        imageUrl = image.path;
    }
    else{
        imageUrl = req.body.imageUrl;
    }

    try{
        const user = await User.findById(userId)
        .populate('posts')
        .populate('friends')
        .exec();

        user.imageUrl = imageUrl;
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Profile pic updated successfully', 
            user: updatedUser
        });
    }
    catch(err){
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    }
}

exports.postAddFriend = async (req, res, next) => {
    try{
        const addedFriendId = req.body.friendId;
        const user = await User.findById(req.userId);
        const updatedFriends = [...user.friends];
        updatedFriends.push(addedFriendId);
        user.friends = updatedFriends;
        await user.save();

        const friend = await User.findOne({_id: addedFriendId}).populate('posts').exec();
        res.status(200).json({message: 'Friend added successfully', friend: friend});
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    }
}

exports.postRemoveFriend = async (req, res, next) => {
    try{
        const removedFriendId = req.body.removedFriendId;
        const user = await User.findById(req.userId);
        const updatedFriends = user.friends.filter(friend => friend._id != removedFriendId);
        user.friends = updatedFriends;
        await user.save();
        res.status(200).json({message: 'Friend removed successfully'});
    }
    catch(err) {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    }
}