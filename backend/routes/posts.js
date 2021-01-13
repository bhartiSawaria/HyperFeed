
const express = require('express');

const postControllers = require('../controllers/post');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post('/add-post', isAuth, postControllers.createPost);

router.get('/feed', isAuth, postControllers.getFeed);

router.get('/post/:postId', isAuth, postControllers.getPost);

router.post('/save-post', isAuth, postControllers.savePost);

router.post('/remove-saved-post', isAuth, postControllers.removeSavedPost);

router.post('/like-post', isAuth, postControllers.likePost);

router.post('/unlike-post', isAuth, postControllers.unlikePost);

router.get('/saved-posts', isAuth, postControllers.getSavedPosts);

router.post('/add-comment', isAuth, postControllers.postComment);

router.delete('/delete-post', isAuth, postControllers.deletePost);

module.exports = router;