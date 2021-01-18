
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user'); 
const { SECRET } = require('../keyInfo');

exports.postSignup = async(req, res, next) => {
    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        const err = new Error('Sign up failed!');
        err.data = errors.array(); 
        err.statusCode = 422;
        // console.log('error is', err);
        console.log('error occured');
        return next(err);
    }

    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const imageUrl = req.body.imageUrl;

    try{
        const hashPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            username: username,
            email: email,
            password: hashPassword,
            imageUrl: imageUrl
        });
        const createdUser = await user.save();
        res.status(201).json({
            message: 'Signed up successfully.',
            user: createdUser
        })
    }
    catch(error) {
        console.log('Error occured!', error);
        error.statusCode = 500;
        next(error);
    }
}

exports.postLogin = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const err = new Error('Login failed!');
        err.statusCode = 422;
        err.data = errors.array();
        return next(err);
    }
    const email = req.body.email;

    try{
        const currentUser = await User.findOne({email: email});
        const token = jwt.sign({
            email: email,
            userId: currentUser._id
        }, SECRET);

        res.status(200).json({
            token: token, 
            userDetails: {
                id: currentUser._id, 
                username: currentUser.username, 
                imageUrl: currentUser.imageUrl
            }
        });
    }
    catch(err) {
        const error = new Error('Cannot find user!');
        error.statusCode = 500;
        next(error);
    }
}