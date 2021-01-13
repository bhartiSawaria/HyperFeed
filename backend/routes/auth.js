
const express = require('express');
const { body } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const User = require('../modals/user');
const authControllers = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, {req}) => {
            return User.findOne({email: value}).then(user => {
                if(user){
                    return Promise.reject('Email address already exist.')
                }
            })
        }),
    
        body('username')
            .trim()
            .isLength({min: 3})
            .withMessage('Username should atleast be 3 characters long.')
            .custom((value, {req}) => {
                return User.findOne({username: value}).then(user => {
                    if(user){
                        return Promise.reject('Username already taken.');
                    }
                })
            }),
        
        body('name')
            .trim()
            .isLength({min: 3})
            .withMessage('Name should atleast be 3 characters long.'),

        body('password')
            .trim()
            .isLength({min: 5})
            .withMessage('Password must atleast be 5 characters long.'),

        body('confirmPassword')
            .custom((value, {req}) => {
                if(!(value === req.body.password)){
                    throw new Error('Passwords do not match.');
                }
                return true;
            })
    ],
    authControllers.postSignup);

router.post('/login', [
    body('email')
    .custom((value, {req}) => {
        return User.findOne({email: value}).then(user => {
            if(!user){
                return Promise.reject('E-mail not registered.');
            }
        })
    }),
    body('password')
    .custom((value, {req}) => {
        return User.findOne({email: req.body.email}).then(user => {
            if(user){
                return bcrypt.compare(value, user.password)
                    .then(isEqual => {
                        if(!isEqual){
                            return Promise.reject('Password is incorrect.');
                        }
                    })
            }
        })
    })
],authControllers.postLogin);

module.exports = router;

