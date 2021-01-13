
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';

import classes from './MyPosts.module.css';
import Post from '../../Feed/Post/Post';
import Spinner from '../../Spinner/Spinner';
import Backdrop from '../../Backdrop/Backdrop';

class MyPosts extends Component{

    state = {
        posts: [],
        isLoading: true,
        isDeleting: false,
        showBackdrop: false,
        showModal: false,
        clickedPost: null
    }

    sortByDateAsc = (a, b) => { 
        if(a.createdAt < b.createdAt){
            return 1;
        }
        return -1;
    }

    showBackdropHandler = () => this.setState({showBackdrop: true});

    hideBackdropHandler = () => this.setState({showBackdrop: false, showModal: false, clickedPost: null});

    showModalHandler = () => this.setState({showModal: true}); 

    componentDidMount(){
        this.fetchPostsFromDatabase();
    }

    fetchPostsFromDatabase = () => {
        fetch('http://localhost:8080/user/posts',{
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            console.log('Result ', result);
            const posts = result.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts, isLoading: false});
        })
        .catch(err => {
            console.log('Error in MyPosts', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    deleteIconClickHandler = (postId) => {
        this.showBackdropHandler();
        this.showModalHandler();
        this.setState({clickedPost: postId});
    }

    deletePostHandler = () => {
        const postId = this.state.clickedPost;
        this.setState({isDeleting: true});
        fetch('http://localhost:8080/delete-post', {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + this.props.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId: postId,
                userId: this.props.user.id
            })
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            this.setState({isDeleting: false});
            console.log('Result ', result);
            this.fetchPostsFromDatabase();
            this.hideBackdropHandler();
        })
        .catch(err => {
            this.setState({isDeleting: false});
            console.log('Error in deleting post', err);
            this.props.history.push('/error');
        })
    }

    render(){
        let myPosts = this.state.posts.map(post => {
            return <Post 
                key={post._id} 
                post={post} 
                token={this.props.token} 
                canDelete={true}
                clickDelete={() => this.deleteIconClickHandler(post._id)}/>
        });

        if(this.state.posts.length === 0){
            myPosts = <p className={classes.NoPost}>You have not posted anything.</p>
        }

        if(this.state.isLoading){
            myPosts = <Spinner />
        }

        const backdrop = this.state.showBackdrop ? <Backdrop clicked={this.hideBackdropHandler} /> : null;
        const modal = this.state.showModal ? (
            <div className={classes.Modal}>
                    <p>Are you sure you want to delete this post?</p>
                    <p>This action can not be undone.</p>
                    <Button 
                        color='green'
                        onClick={this.hideBackdropHandler}>
                        Cancel
                    </Button>
                    <Button 
                        color='red'
                        loading={this.state.isDeleting}
                        onClick={this.deletePostHandler}>Delete</Button>
                </div>
        ) : null;
        
        return(
            <div className={classes.RootContainer}>
                {backdrop}
                {modal}
                {this.state.posts.length > 0 ? <p className={classes.PageHeading}>{this.props.user.username}'s posts</p> : null} 
                {this.state.posts.length > 0 ? <hr/> : null}
                {myPosts}
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        user: state.auth.userDetails
    }
}

export default connect(mapStateToProps)(MyPosts);