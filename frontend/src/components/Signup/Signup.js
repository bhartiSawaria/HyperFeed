
import React, { Component } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import classes from './Signup.module.css';
import profilePic from '../../assets/images/user2.png';

class Signup extends Component{

    state = {
        userInfo: {
            name: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            imageUrl: profilePic
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
        const { name, username, email, password, confirmPassword } = this.state.userInfo;
        return !(name.length && username.length && email.length && password.length && confirmPassword.length);
    }

    isNameValid = () => {
        const { name } = this.state.userInfo;
        if( name.trim().length < 3 ){
            return false;
        }
        return true;
    }

    isPasswordValid = () => {
        const { password } = this.state.userInfo;
        if( password.trim().length < 5 ){
            return false;
        }
        return true;
    }

    doesPasswordMatches = () => {
        const { password, confirmPassword } = this.state.userInfo;
        if( password === confirmPassword ){
            return true;
        }
        return false;
    }

    isFormValid = () => {
        if(this.isAnyFieldEmpty()){
            this.setState({error: 'Please fill all the fields.'})
            return false;
        }
        else if(!this.isNameValid()){
            this.setState({error: 'Name should atleast be 3 characters long.'});
            return false;
        }
        else if(!this.isPasswordValid()){
            this.setState({error: 'Password should atleast be 5 characters long.'});
            return false;
        }
        else if(!this.doesPasswordMatches()){
            this.setState({error: 'Password do not match.'});
            return false;
        }
        else{
            return true;
        }
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
            fetch('http://localhost:8080/signup',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state.userInfo)
            })
            .then(result => {
                console.log('Status is: ', result.status);
                this.setState({isLoading: false});
                return result.json()
            })
            .then(result => {
                console.log('Result ka data', result.data);
                if( result.data ){
                    this.setState({error: result.data[0].msg});
                }
                else{
                    this.props.history.push('/login');
                }
                console.log('result is', result);
            })
            .catch(err => {
                this.setState({isLoading: false});
                console.log('Error in signup frontend ', err);
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
                    <h1 style={{marginBottom: '2rem'}}>SIGNUP</h1>
                    <Form.Input
                        fluid
                        icon='user'
                        iconPosition='left' 
                        name='name'
                        type='text'
                        placeholder='Your Name'
                        value={this.state.userInfo.name}
                        onChange={this.formInputChangeHandler}/>

                    <Form.Input
                        fluid
                        icon='user'
                        iconPosition='left' 
                        name='username'
                        type='text'
                        placeholder='Username'
                        value={this.state.userInfo.username}
                        onChange={this.formInputChangeHandler}/>

                    <Form.Input
                        fluid
                        icon='mail'
                        iconPosition='left' 
                        name='email'
                        type='email'
                        placeholder='Your E-mail'
                        value={this.state.userInfo.email}
                        onChange={this.formInputChangeHandler}/>

                    <Form.Input
                        fluid
                        icon='lock'
                        iconPosition='left' 
                        name='password'
                        type='password'
                        placeholder='Password'
                        value={this.state.userInfo.password}
                        onChange={this.formInputChangeHandler}/>

                    <Form.Input
                        fluid
                        icon='repeat'
                        iconPosition='left' 
                        name='confirmPassword'
                        type='password'
                        placeholder='Confirm Password'
                        value={this.state.userInfo.confirmPassword}
                        onChange={this.formInputChangeHandler}/>

                    {error}

                    <Button 
                        fluid 
                        color='green'
                        loading={this.state.isLoading} 
                        style={{margin: '2rem auto'}} 
                        onClick={this.formSubmitHandler}>Submit</Button>

                    <p>Already have an account? <Link to='/login'>Login</Link></p>
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

export default connect(mapStateToProps)(Signup);