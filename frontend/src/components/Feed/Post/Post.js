
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { BsChat  } from "react-icons/bs";
// import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import moment from 'moment';
import {withRouter} from 'react-router-dom';

import deleteIcon from '../../../assets/images/delete.png';
import Comment from '../../Comment/Comment';
import Backdrop from '../../Backdrop/Backdrop';

import classes from './Post.module.css';

class Post extends Component{

    state = {
        id: this.props.post._id,
        likesCount: this.props.post && this.props.post.likedBy.length,
        commentsCount: this.props.post && this.props.post.comments.length,
        comment: '',
        showModal: false,
        showBackdrop: false,
        allComments: []
    }

    likeIconClickHandler = (event) => {
        const id = this.state.id + '-like-icon';
        const icon = document.getElementById(id);
        let isOutlined = icon.classList.contains('outline');
        if(isOutlined){
            this.setState({likesCount: this.state.likesCount + 1});
            icon.classList.remove('outline');
            icon.style.color = 'red';
            fetch('http://localhost:8080/like-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    postId: this.state.id
                })
            })
            .then(result => {
                console.log('Result 1', result);
                return result.json();
            })
            .then(result => {
                console.log('Result 2', result);
                // this.setState({likesCount: this.state.likesCount + 1});
            })
            .catch(err => {
                console.log('Error in like-post', err);
                this.props.history.push('/error');
            })
        }
        else{
            icon.classList.add('outline');
            icon.style.color = '';
            this.setState({likesCount: this.state.likesCount - 1});
            fetch('http://localhost:8080/unlike-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    postId: this.state.id
                })
            })
            .then(result => {
                console.log('Result 1', result);
                return result.json();
            })
            .then(result => {
                console.log('Result 2', result);
            })
            .catch(err => {
                console.log('Error in unlike-post', err);
                this.props.history.push('/error');
            })
        }
    }

    saveIconClickHandler = () => {
        const id = this.state.id + '-save-icon';
        const icon = document.getElementById(id);
        console.log(icon);
        let isOutlined = icon.classList.contains('outline');
        if(isOutlined){
            icon.classList.remove('outline');
            fetch('http://localhost:8080/save-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    postId: this.state.id
                })
            })
            .then(result => {
                console.log('Result 1', result);
                return result.json();
            })
            .then(result => {
                console.log('Result 2', result);
            })
            .catch(err => {
                console.log('Error in saving a post', err);
                this.props.history.push('/error');
            })
        }
        else{
            icon.classList.add('outline');
            fetch('http://localhost:8080/remove-saved-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    postId: this.state.id
                })
            })
            .then(result => {
                console.log('Result 1', result);
                return result.json();
            })
            .then(result => {
                console.log('Result 2', result);
            })
            .catch(err => {
                console.log('Error in removing a saved post', err);
                this.props.history.push('/error');
            })
        }
    }

    inputChangeHandler = (event) => {
        this.setState({comment: event.target.value});
    }

    postCommentHandler = (event) => {
        event.preventDefault();
        if(this.state.comment !== ''){
            // this.setState({commentsCount: this.state.commentsCount + 1});
            fetch("http://localhost:8080/add-comment", {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + this.props.token
                },
                body: JSON.stringify({
                    postId: this.state.id,
                    commentInfo: {
                        message: this.state.comment,
                        postedBy: this.props.user.id
                    }
                })
            })
            .then(result => {
                return result.json();
            })
            .then(result => {
                console.log(' Result is ', result);
                this.setState({comment: '', commentsCount: this.state.commentsCount + 1}, () => {
                    this.showCommentsHandler();
                });
            })
            .catch(err => {
                console.log('Error in Add Comment', err);
                this.props.history.push('/error');
            })
        }
    }

    showCommentsHandler = () => {
        this.setState({showBackdrop: true, showModal: true});
        const url = "http://localhost:8080/post/" + this.state.id;
        fetch(url, {
            method: 'Get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => result.json())
        .then(result => {
            console.log(' Result is ', result);
            this.setState({allComments: result.post.comments});
        })
        .catch(err => {
            console.log('Error in getting a single post', err);
            this.props.history.push('/error');
        })
    }

    hideCommentsHandler = () => {
        this.setState({showModal: false, showBackdrop: false});
    }

    render(){
        let username = this.props.post.postedBy && this.props.post.postedBy.username;
        // const modal = this.props.post.comments
        let commentsList = <div className={classes.NoCommentDiv}>No Comment!!</div>
        if(this.state.commentsCount > 0){
            commentsList = this.state.allComments.map(comment => {
                return <Comment key={comment.postedAt} comment={comment}/>
            });
        }
        
        let modal = null;
        if(this.state.showModal){
            modal = (
                <div className={classes.CommentsModal}>
                    {commentsList}
                </div>
            )
        }

        let backdrop = null;
        if(this.state.showBackdrop){
            backdrop = <Backdrop clicked={this.hideCommentsHandler}/>
        }

        return (
            <React.Fragment>
                {backdrop}
                {modal}
                <div className={classes.RootContainer}>
                    <div className={classes.UsernameContainer}>
                        {this.props.post.postedBy ? 
                            <img 
                                src={this.props.post.postedBy.imageUrl } alt='Dp'/> 
                        : null}
                        <p>{username}</p>
                        <span>{moment(this.props.post.createdAt).fromNow()}</span>
                    </div>
                    { this.props.post.imageUrl ? (
                        <div className={classes.ImageContainer}>
                            <img src={this.props.post.imageUrl} alt={this.props.post.username} />
                        </div>
                    ) : null}
                    <div className={classes.BottomPartContainer}>
                        <div className={classes.IconsContainer}> 
                            {this.props.post.isLiked ? (
                                <Icon 
                                    name='heart' 
                                    size='big' 
                                    color='red'
                                    id={this.state.id + '-like-icon'}  
                                    onClick={this.likeIconClickHandler}/>
                                ) : (
                                <Icon 
                                    name='heart outline' 
                                    size='big' 
                                    id={this.state.id + '-like-icon'}  
                                    onClick={this.likeIconClickHandler}/>
                            )}
                            <BsChat 
                                size={32}
                                onClick={this.showCommentsHandler}/>
                            {/* <Icon 
                                name='chat' 
                                size='big'
                                onClick={this.showCommentsHandler}/> */}
                            {this.props.post.isSaved ? (
                                <Icon 
                                    name='bookmark' 
                                    size='big' 
                                    id={this.state.id + '-save-icon'} 
                                    onClick={this.saveIconClickHandler}/>
                                ) : (
                                <Icon 
                                    name='bookmark outline' 
                                    size='big' 
                                    id={this.state.id + '-save-icon'} 
                                    onClick={this.saveIconClickHandler}/>
                            )}
                            {this.props.canDelete ? 
                                <img 
                                    src={deleteIcon} 
                                    alt='delete' 
                                    style={{height: '30px', width: '30px'}}
                                    onClick={this.props.clickDelete}/>
                                // <Icon name='trash alternate outline' size='big' />
                                : null 
                            } 
                        </div>
                        <p>{this.state.likesCount} likes</p>
                        { this.props.post.content ? (
                            <div className={classes.ContentContainer}>
                                <h1>{username}</h1>
                                <p>{this.props.post.content}</p>
                            </div>
                        ) : null}

                        {this.state.commentsCount > 0 ? (
                            <div 
                                className={classes.ViewComments}
                                onClick={this.showCommentsHandler}>View all {this.state.commentsCount} comments </div>
                        ) : null}
                    </div>
                    <div className={classes.AddCommentContainer}>
                        <input 
                            type='text' 
                            name='comment'
                            placeholder='Add a comment'
                            value={this.state.comment} 
                            onChange={this.inputChangeHandler}/>
                        <button onClick={this.postCommentHandler}>Post</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: {...state.auth.userDetails},
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(withRouter(Post));