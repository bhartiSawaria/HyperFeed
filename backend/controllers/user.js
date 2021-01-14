
const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');

exports.getProfile = (req, res, next) => {
    User.findById(req.userId)
    .populate('posts')
    .populate('friends')
    .exec()
    .then(user => {
        if(user){
            res.status(200).json({message: 'User info fetched successfully.', user: user});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = err.status || 500;    
        next(error);
    });
}

exports.postEditAccount = (req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        const err = new Error('Editing failed!');
        err.data = errors.array(); 
        console.log('Error occured in postEditAccount', errors);
        throw err;
    }

    const userId = req.userId;
    User
    .findById(userId)
    .populate('posts')
    .populate('friends')
    .exec()
    .then(user => {
        user.name = req.body.name;
        user.username = req.body.username;
        user.email = req.body.email;
        return user.save();
    })
    .then(user => {
        if(user){
            res.status(200).json({message: 'Account info updated successfully.', user: user});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = err.status || 500;    
        next(error);
    })
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

exports.getUsers = (req, res, next) => {
    User.findById(req.userId)
    .then(user => {
        if(user){
            return User.find({_id: {$nin: [...user.friends, user._id]}});
        }
    })
    .then(users => {
        res.status(200).json({message: 'Users successfully fetched from database.', users: users});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    })
}

exports.changeProfilePic = (req, res, next) => {
    const userId = req.userId;
    const image = req.file;
    let imageUrl;
    if(image){
        imageUrl = image.path;
    }
    else{
        imageUrl = req.body.imageUrl;
    }

    User.findById(userId)
    .populate('posts')
    .populate('friends')
    .exec()
    .then(user => {
        if(user){
            user.imageUrl = imageUrl;
            return user.save();
        }
    })
    .then(user => {
        res.status(200).json({message: 'Profile pic updated successfully', user: user});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    })
}

exports.postAddFriend = (req, res, next) => {
    const addedFriendId = req.body.friendId;
    User.findById(req.userId)
    .then(user => {
        if(user){
            const updatedFriends = [...user.friends];
            updatedFriends.push(addedFriendId);
            user.friends = updatedFriends;
            return user.save();
        }
    })
    .then(() => User.findOne({_id: addedFriendId}).populate('posts').exec())  
    .then(user => {
        if(user)
            res.status(200).json({message: 'Friend added successfully', friend: user});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    })
}

exports.postRemoveFriend = (req, res, next) => {
    const removedFriendId = req.body.removedFriendId;

    User.findById(req.userId)
    .then(user => {
        if(user){
            const updatedFriends = user.friends.filter(friend => friend._id != removedFriendId);
            user.friends = updatedFriends;
            return user.save();
        }
    })
    .then(user => {
        res.status(200).json({message: 'Friend removed successfully'});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        next(error); 
    })
}