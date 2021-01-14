
import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import mime from 'mime-types';

import fetcher from '../../fetchWrapper';
import classes from './AddPost.module.css';

class AddPost extends Component{

    state = {
        content: '',
        image: null,
        supportedFiles: ['image/jpg', 'image/png', 'image/jpeg'],
        isLoading: false,
        error: ''
    }

    isInputValid = () => {
        if(this.state.image){
            const mimeType = mime.lookup(this.state.image.name);
            const isSupported = this.state.supportedFiles.includes(mimeType);
            if( !isSupported ){
                this.setState({error: 'Supported image types are only jpg, png and jpeg!!'});
                return false;
            }
            return true;
        }
        else{
            this.setState({error: 'Please select an image!!'});
            return false;
        }
    }

    inputChangeHandler = (event) => {
        this.setState({error: ''});
        const type = event.target.name;
        console.log("Input type: ", type);
        if( type === 'image'){
            const image = event.target.files[0];
            if(image){
                this.setState({ image })
            }
            else{
                this.setState({ image: null });
            }
        }
        else{
            this.setState({[event.target.name]: event.target.value});
        }
    }

    postSubmitHandler = () => {
        if(this.isInputValid()){
            this.setState({isLoading: true});
            const formData = new FormData();
            formData.append('content', this.state.content);
            formData.append('image', this.state.image);
            formData.append('userId', this.props.user.id);
            fetcher('/add-post', {
                method: 'Post',
                body: formData
            }, true)
            .then(result => {
                console.log('1. Result is ', result);
                return result.json();
            })
            .then(result => {
                console.log('2. Result is ', result);
                this.setState({isLoading: false});
                this.props.history.push('/feed');
            })
            .catch(err => {
                console.log('Error in PostType1', err);
                this.setState({isLoading: false});
                this.props.history.push('/error');
            })
        }
    }

    render(){
        let error = null;
        if( this.state.error !== '' ){
            error = <p style={{color: 'red'}}>{this.state.error}</p>
        }
        return(
            <div className={classes.RootContainer}>
                <h2>Share with others</h2>
                <div className={classes.InputField}>
                    <input 
                        type='file'
                        name='image'
                        onChange={this.inputChangeHandler}/>
                </div>
                <div className={classes.InputField}>
                    <textarea 
                        name='content'
                        placeholder='Write something...' 
                        rows='10'
                        value={this.state.content}
                        onChange={this.inputChangeHandler} />
                </div>
                {error}
                <Button 
                    className={classes.PostButton} 
                    loading={this.state.isLoading}
                    color='green'
                    style={{margin: '1rem auto'}}
                    onClick={this.postSubmitHandler}>Post
                </Button>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        user: {...state.auth.userDetails},
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(AddPost);

