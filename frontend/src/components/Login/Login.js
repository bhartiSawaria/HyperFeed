
import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import classes from './Login.module.css';
import * as actionCreators from '../../actions/index';

class Login extends Component{

    state = {
        userInfo: {
            email: '',
            password: ''
        },
        isLoading: false,
        error: ''
    }

    componentDidMount(){
        if( this.props.isAuth ){
          this.props.history.push('/');
        }
    }

    isAnyFieldEmpty = () => {
        const { email, password } = this.state.userInfo;
        return !(email.length && password.length);
    }

    isFormValid = () => {
        if(this.isAnyFieldEmpty()){
            this.setState({error: 'Please fill all the fields.'})
            return false;
        }
        return true;   
    }

    formInputChangeHandler = (event) => {
        this.setState({error: ''});
        const updatedUserInfo = {...this.state.userInfo};
        updatedUserInfo[event.target.name] = event.target.value;
        this.setState({userInfo: updatedUserInfo});
    }

    formSubmitHandler = (event) => {
        event.preventDefault();
        if( this.isFormValid() ){
            this.setState({isLoading: true});
            fetch('http://localhost:8080/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.userInfo)
            })
            .then(result => {
                // console.log('Status is: ', result.status);
                this.setState({isLoading: false});
                return result.json();
            })
            .then(result => {
                if( result.data ){
                    this.setState({error: result.data[0].msg});
                }
                else{
                    this.props.setStatusToLogin(result.userDetails, result.token);
                    this.props.history.push('/feed');
                }
            }) 
            .catch(err => {
                this.setState({isLoading: false, isLogin: false});
                console.log('Error in login frontend ', err);
                this.props.history.push('/error');
            });
        }
    }

    render(){
        let error = null;
        if( this.state.error !== '' ){
            error = <p style={{color: 'red'}}>{this.state.error}</p>
        }
        return (
            <div className={classes.RootContainer}>
                <Form>
                    <h1 style={{marginBottom: '2rem'}}>LOGIN</h1>

                    <Form.Input
                        fluid
                        icon='mail'
                        iconPosition='left' 
                        name='email'
                        type='email'
                        placeholder='Your E-mail'
                        value={this.state.email}
                        onChange={this.formInputChangeHandler}/>

                    <Form.Input
                        fluid
                        icon='lock'
                        iconPosition='left' 
                        name='password'
                        type='password'
                        placeholder='Password'
                        value={this.state.password}
                        onChange={this.formInputChangeHandler}/>

                    {error}

                    <Button 
                        fluid 
                        loading={this.state.isLoading}
                        color='green' 
                        style={{margin: '2rem auto'}}
                        onClick={this.formSubmitHandler}>Submit       
                    </Button>

                    <p>Don't have an account? <Link to='/signup'>Signup</Link></p>
                </Form>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        isAuth: state.auth.isAuth
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setStatusToLogin: (userDetails, token) => dispatch(actionCreators.setStatusToLogin(userDetails, token))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);