
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); 
const SECRET = 'mySecret';

exports.postSignup = (req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        const err = new Error('Sign up failed!');
        err.data = errors.array(); 
        console.log('Error occured in postSignup', errors);
        throw err;
    }

    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const imageUrl = req.body.imageUrl;

    bcrypt
        .hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                name: name,
                username: username,
                email: email,
                password: hashPassword,
                imageUrl: imageUrl
            });
            return user.save();
        })
        .then(user => {
            res.status(201).json({
                message: 'Signed up successfully.',
                user: user
            })
        })
        .catch(err => {
            console.log('Error occured!', err);
        })
}

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const err = new Error('Login failed!');
        err.statusCode = 401;
        err.data = errors.array();
        throw err;
    }
    const email = req.body.email;
    const password = req.body.password;
    let currentUser;

    User.findOne({email: email})
    .then(user => {
        currentUser = user;
        const token = jwt.sign({
            email: email,
            userId: user._id
        }, SECRET);
    
        res.status(200).json({token: token, userDetails: {id: currentUser._id, username: currentUser.username, imageUrl: currentUser.imageUrl}});
    })
    .catch(err => {
        const error = new Error('Cannot find user!');
        error.statusCode = 500;
        next(error);
    })
}