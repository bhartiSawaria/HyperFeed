
const { validationResult } = require('express-validator/check');

const User = require('../modals/user');
const Post = require('../modals/post');

exports.getProfile = (req, res, next) => {
    User.find({_id: req.userId})
    .populate('posts')
    .populate('friends')
    .exec()
    .then(users => {
        if(users.length > 0){
            res.status(200).json({message: 'User info fetched successfully.', user: users[0]});
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
        User.findById(userId).then(user => {
            user.name = req.body.name;
            user.username = req.body.username;
            user.email = req.body.email;
            return user.save();
        })
        .then(user => {
            return User.find({_id: user._id}).populate('posts').populate('friends').exec();
        })
        .then(users => {
            if(users && users.length > 0){
                res.status(200).json({message: 'Account info updated successfully.', user: users[0]});
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
        return next(error);
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
        return next(error); 
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
    .then(user => {
        if(user){
            user.imageUrl = imageUrl;
            return user.save();
        }
    })
    .then(user => {
        return User.find({_id: user._id})
                .populate('posts')
                .populate('friends')
                .exec();
    })
    .then(users => {
        if(users && users.length > 0){
            res.status(200).json({message: 'Profile pic updated successfully', user: users[0]});
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error); 
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
    .then(() => User.find({_id: addedFriendId}).populate('posts').exec())  
    .then(users => {
        if(users.length > 0)
            res.status(200).json({message: 'Friend added successfully', friend: users[0]});
    })
    .catch(err => {
        const error = new Error(err);
        error.setStatus = 500;    
        return next(error); 
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
        return next(error); 
    })
}