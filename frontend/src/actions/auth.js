import * as actionTypes from './actionTypes';

export const setStatusToLogin = (userDetails, token) => {
    return {
        type: actionTypes.SET_LOGIN_STATUS,
        payload: {
            userDetails: {...userDetails},
            token: token
        }
    }
}

export const setStatusToLogout = () => {
    return {
        type: actionTypes.SET_LOGOUT_STATUS
    }
}