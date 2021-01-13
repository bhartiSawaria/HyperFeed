
import React from 'react';

import classes from './Comment.module.css';

const comment = (props) => {
    const date = new Date(props.comment.postedAt);
    return(
        <div className={classes.RootContainer}>
            <div className={classes.ImageContainer}>
                <img src={props.comment.postedBy.imageUrl} alt='Dp'/>
            </div>
            <div className={classes.DataContainer}>
                <p>{props.comment.postedBy.username}</p>
                <p>{date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</p>
                <p>{props.comment.message}</p>    
            </div>
        </div>
    )
}

export default comment;