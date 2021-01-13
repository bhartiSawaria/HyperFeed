
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import classes from './SavedPost.module.css';
import { Icon } from 'semantic-ui-react';
import moment from 'moment';

class SavedPost extends Component{

    state = {
        id: this.props.post._id
    }

    likeIconClickHandler = () => {
        const id = this.state.id + '-like-icon';
        const icon = document.getElementById(id);
        let isOutlined = icon.classList.contains('outline');
        if(isOutlined){
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
            })
            .catch(err => {
                console.log('Error in like-post', err);
                this.props.history.push('/error');
            })
        }
        else{
            icon.classList.add('outline');
            icon.style.color = 'black';
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

    render(){
        let username = this.props.post.postedBy && this.props.post.postedBy.username;
        return (
            <div className={classes.RootContainer}>
                <div className={classes.UsernameContainer}>
                {this.props.post.postedBy && this.props.post.postedBy.imageUrl ? 
                    <img 
                        src={this.props.post.postedBy.imageUrl} alt='profilePic'/> 
                : null}
                    <p>{username}</p>
                    <span>{moment(this.props.post.createdAt).fromNow()}</span>
                </div>
                <hr/>
                { this.props.post.title ? (
                    <div className={classes.Title}>
                        <p>{this.props.post.title}</p>
                    </div>
                ) : null}
                { this.props.post.content ? (
                    <div className={classes.Content}>
                        <p>{this.props.post.content}</p>
                        <hr/>
                    </div>
                ) : null}
                { this.props.post.imageUrl ? (
                    <div className={classes.ImageContainer}>
                        <img src={this.props.post.imageUrl} alt={this.props.post.username} />
                    </div>
                ) : null}
                { this.props.post.caption ? (
                    <div className={classes.Caption}>
                        <p>{this.props.post.caption}</p>
                        <hr/>
                    </div>
                ) : null}
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

                    {this.props.post.isSaved ? (
                        <Icon 
                            name='bookmark' 
                            size='big' 
                            id={this.state.id + '-save-icon'} 
                            style={{position: 'absolute', right: '0px'}} 
                            onClick={this.saveIconClickHandler}/>
                        ) : (
                        <Icon 
                            name='bookmark outline' 
                            size='big' 
                            id={this.state.id + '-save-icon'} 
                            style={{position: 'absolute', right: '0px'}} 
                            onClick={this.saveIconClickHandler}/>
                    )}
                </div>
            </div>
        )
    }
};

export default withRouter(SavedPost);