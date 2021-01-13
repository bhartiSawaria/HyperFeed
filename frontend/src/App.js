import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import classes from './App.module.css';
import Navbar from './components/Navbar/Navbar';
import Signup from './components/Signup/Signup';
import Login from './components/Login/Login';
import * as actionCreators from './actions/index';
import HomePage from './components/HomePage/HomePage';
import AddPost from './components/AddPost/AddPost';
import Feed  from './components/Feed/Feed';
import SavedPosts from './components/SavedPosts/SavedPosts';
import Profile from './components/Profile/Profile';
import MyPosts from './components/Profile/MyPosts/MyPosts';
import Error from './components/Error/Error';

class App extends Component{

  componentDidMount(){
    const token = localStorage.getItem('token');
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    if( token && userDetails ){
      this.props.setStatusToLogin(userDetails, token);
      this.props.history.push('/feed');
    }
  }

  logoutHandler = () => {
    this.props.setStatusToLogout();
    this.props.history.push('/');
  }

  render(){
    return(
        <div className={classes.RootContainer}>
          <Navbar isAuth={this.props.isAuth} setStatusToLogout={this.logoutHandler} userInfo={this.props.userInfo}/>
          <Switch>
            {!this.props.isAuth ? <Route exact path='/signup' component={Signup}/> : null }
            {!this.props.isAuth ? <Route exact path='/login' component={Login}/> : null }
            {this.props.isAuth ? <Route exact path='/my-profile' component={Profile}/> : null }
            {this.props.isAuth ? <Route exact path='/my-posts' component={MyPosts}/> : null }
            {this.props.isAuth ? <Route exact path='/feed' component={Feed}/> : null}
            {this.props.isAuth ? <Route exact path='/add-post' component={AddPost}/> : null }  
            {this.props.isAuth ? <Route exact path='/saved-posts' component={SavedPosts}/> : null }
            {this.props.isAuth ? <Route exact path='/' component={Feed}/> : null }
            <Route exact path='/error' component={Error}/> 
            <Route path='/' component={HomePage} />
          </Switch>
        </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    isAuth: state.auth.isAuth,
    userInfo: state.auth.userDetails
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setStatusToLogin: (userDetails, token) => dispatch(actionCreators.setStatusToLogin(userDetails, token)),
    setStatusToLogout: () => dispatch(actionCreators.setStatusToLogout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
 