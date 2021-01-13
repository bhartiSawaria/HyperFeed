
import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './SavedPosts.module.css';
import Post from '../Feed/Post/Post';
import Spinner from '../Spinner/Spinner';

class SavedPosts extends Component{

    state = {
        posts: [],
        isLoading: true
    }

    sortByDateAsc = (a, b) => { 
        if(a.createdAt < b.createdAt){
            return 1;
        }
        return -1;
    }

    componentDidMount(){
        fetch('http://localhost:8080/saved-posts',{
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            console.log('Result 1', result);
            return result.json();
        })
        .then(result => {
            console.log('Result 2', result);
            const posts = result.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts, isLoading: false});
            console.log('state 1', this.state);
        })
        .catch(err => {
            console.log('Error in saved-posts', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    render(){
        // let posts = this.state.posts.map(post => {
        //     return <SavedPost key={post._id} post={post} token={this.props.token}/>
        // });
        let posts = this.state.posts.map(post => {
            return <Post key={post._id} post={post} token={this.props.token}/>
        });

        if(this.state.posts.length === 0){
            posts = <p style={{fontSize: '16px'}}>You have not saved any post.</p>
        }

        if(this.state.isLoading){
            posts = <Spinner />
        }
        return(
            <div className={classes.RootContainer}>
                <p style={{fontSize: '24px'}}>Saved Posts</p>
                <hr/>
                {posts}
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(SavedPosts);