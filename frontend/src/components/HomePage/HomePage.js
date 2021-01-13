
import React, { Component } from 'react';
import Particles from 'react-particles-js';

import classes from './HomePage.module.css';

class HomePage extends Component{

    startButtonClickHandler = () => {
        this.props.history.push('/signup');
    }

    render(){
        return(
            <div className={classes.RootContainer}>
                {/* <img src={mainImage} alt='mainImage' /> */}
                {/* <div> */}
                    <p>HyperFeed</p>
                    <p>Connecting you with people</p>
                    <button onClick={this.startButtonClickHandler}>Get Started</button>
                {/* </div> */}
                <Particles
                    params={{
                        particles: {
                            color: {
                                value: "#ffffff"
                            },
                            line_linked: {
                                color: {
                                    value: "#ffffff"
                                }
                            },
                            number: {
                                value: 150
                            },
                            size: {
                                value: 3
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        // backgroundImage: `url(${mainImage})`,
                        backgroundColor: `rgba(0, 0, 0, 1)`
                    }}
                />
            </div>
        )
    }
};

export default HomePage;