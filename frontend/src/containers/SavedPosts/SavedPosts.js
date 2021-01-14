
import React, { Component } from 'react';

import classes from './SavedPosts.module.css';
import Post from '../Post/Post';
import Spinner from '../../components/Spinner/Spinner';
import fetcher from '../../fetchWrapper';

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
        fetcher('/saved-posts',{
            method: 'GET'
        })
        .then(result => result.json())
        .then(result => {
            const posts = result.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts, isLoading: false});
        })
        .catch(err => {
            console.log('Error in saved-posts', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    render(){
        let posts = this.state.posts.map(post => {
            return <Post key={post._id} post={post} />
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

export default SavedPosts;