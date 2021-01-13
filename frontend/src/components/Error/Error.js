
import React from 'react';

import classes from './Error.module.css';
import Backdrop from '../Backdrop/Backdrop';

const error = (props) => {
    return (
        <div className={classes.RootContainer}>
            <Backdrop />
            <div className={classes.Modal}>
                <p>Some error occured!!</p>
            </div>
        </div>
    )
}

export default error;