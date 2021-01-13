
import React from 'react';

import classes from './User.module.css';

const user = (props) => {
    return(
        <div className={classes.RootContainer} id={props.user._id}>
            <div className={classes.ImageContainer}>
                <img src={props.user.imageUrl} alt='Dp'/>
            </div>
            <div>
                <span>{props.user.username}</span><br/>
                <span>{props.user.name}</span>
            </div>
            <div>
                <button onClick={props.isAdd ? props.onClickAdd : props.onClickRemove}>
                    {props.isAdd ? `+` : `-`}
                </button>
            </div>  
        </div>
    )
}

export default user;