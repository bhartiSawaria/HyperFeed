
import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './Feed.module.css';
import Post from '../Post/Post';
import User from '../../components/User/User';
import Spinner from '../../components/Spinner/Spinner';
import Backdrop from '../../components/Backdrop/Backdrop';
import fetcher from '../../fetchWrapper';

class Feed extends Component{

    state = {
        posts: [],
        suggestions: [],
        showBackdrop: false,
        showModal: false,
        addedFriend: {},
        isLoading: true,
        isPostLoading: false
    }

    sortByDateAsc = (a, b) => { 
        if(a.createdAt < b.createdAt){
            return 1;
        }
        return -1;
    }

    loadData(){
      /*  fetcher('/feed', 'GET')
        .then(result => {

            if(result.isError)
                throw new Error();

            const posts = result.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts});
            return result = fetcher('/users', 'GET' );
        })
        .then(result => {
            if(result.isError)
                throw new Error();
            this.setState({suggestions: result.users, isLoading: false});
        })
        .catch(err => {
            console.log('Error in Addpost');
            this.setState({isLoading: false});
            this.props.history.push('/error');
        }) */

        Promise.all([
            fetcher('/feed', 'GET'),
            fetcher('/users', 'GET')
        ])
        .then(([result1, result2]) => {
            if(result1.isError || result2.isError)
                throw new Error('Error in getting feed.');
            const posts = result1.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts, suggestions: result2.users, isLoading: false});
        })
        .catch(err => {
            console.log(err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    componentDidMount = () => {
        this.loadData();
    }

    addFriendClickHandler = (addedFriend) => {
        this.setState({ addedFriend: addedFriend, isPostLoading: true});
        let addedFriendContainer = document.getElementById(addedFriend._id);
        addedFriendContainer.remove();
        
        fetcher('/add-friend', 'POST', JSON.stringify({
            friendId: addedFriend._id
        }))
        .then(result => {  
            if(result.isError)
                throw new Error();
            const updatedPosts = [...this.state.posts, ...result.friend.posts.map(post => {
                return {
                    ...post,
                    postedBy: {
                        ...addedFriend
                    }
                }
            })];
            updatedPosts.sort(this.sortByDateAsc);
            this.setState({posts: updatedPosts, isPostLoading: false});
        })
        .catch(err => {
            console.log('Error while adding friend', err);
            this.props.history.push('/error');
        })
    }

    hideBackdropHandler = () => {
        this.setState({showBackdrop: false, showModal: false, addedFriend: {}});
    }

    render(){
        let content = <Spinner />;
        if(!this.state.isLoading){
            let feed = <div className={classes.NoUsersDiv}>No posts...connect to others</div>
            if(this.state.posts.length > 0){
                feed = this.state.posts.map(post => {
                    return <Post key={post._id} post={post}/>
                });
            }      

            let suggestionList = <div>No other users!!</div>
            if(this.state.suggestions.length > 0){
                suggestionList = this.state.suggestions.map(user => {
                    return <User id={user._id} key={user._id} user={user} isAdd={true} onClickAdd={() => this.addFriendClickHandler(user)}/>
                })
            }        

            content = (
                <div className={classes.RootContainer}>
                    {this.state.isPostLoading ? <Spinner /> : (
                        <div className={classes.FeedContainer}>
                            {feed}
                        </div>
                    )}
                    <div className={classes.SuggestionBar}>
                        <p>Connect with others</p>
                        {suggestionList}
                    </div>
                </div>
            )
        }

        const backdrop = <Backdrop clicked={this.hideBackdropHandler}/>

        const modal = <div className={classes.FriendAddedMessage}>{this.state.addedFriend.username} is added to your friend list.</div>
        
        return(
            <React.Fragment>
                {this.state.showBackdrop ? backdrop : null}
                {this.state.showModal ? modal : null}
                {content}
            </React.Fragment>
        )
    }
};

const mapStateToProps = state => {
    return {
        user: {...state.auth.userDetails}
    }
}

export default connect(mapStateToProps)(Feed);