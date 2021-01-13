
const express = require('express');
const {body} = require('express-validator/check');

const isAuth = require('../middlewares/isAuth');
const userControllers = require('../controllers/user');
const User = require('../modals/user');
const user = require('../modals/user');

const router = express.Router();

router.get('/my-profile', isAuth, userControllers.getProfile);

// router.delete('/delete-account', isAuth, userControllers.deleteAccount);

router.post('/edit-account', isAuth, 
[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, {req}) => {
            return User.find({email: value}).then(users => {
                if(users){
                    for(let i=0; i<users.length; i++){
                        if(users[i].email === value && users[i]._id != req.userId){
                            return Promise.reject('Email address already exist.');
                        }
                    }
                }
            })
        }),

        body('username')
        .trim()
        .isLength({min: 3})
        .withMessage('Username should atleast be 3 characters long.')
        .custom((value, {req}) => {
            return User.find({username: value}).then(users => {
                if(users){
                    for(let i=0; i<users.length; i++){
                        if(users[i].username === value && users[i]._id != req.userId){
                            return Promise.reject('Username already taken.');
                        }
                    }
                }
            })
        }),

        body('name')
            .trim()
            .isLength({min: 3})
            .withMessage('Name should atleast be 3 characters long.'),
]
,userControllers.postEditAccount);

router.get('/user/posts', isAuth, userControllers.getPosts);

router.get('/users', isAuth, userControllers.getUsers);

router.post('/change-profile-pic', isAuth, userControllers.changeProfilePic);

router.post('/add-friend', isAuth, userControllers.postAddFriend);

router.post('/remove-friend', isAuth, userControllers.postRemoveFriend);

module.exports = router;