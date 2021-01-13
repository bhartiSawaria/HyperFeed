
import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    isAuth: false,
    userDetails: null
}

const reducer = (state = initialState, action) => {
    switch( action.type ){

        case actionTypes.SET_LOGIN_STATUS:
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('userDetails', JSON.stringify(action.payload.userDetails));
            return {
                ...state,
                isAuth: true,
                userDetails: {...action.payload.userDetails},
                token: action.payload.token
            }

        case actionTypes.SET_LOGOUT_STATUS:
            localStorage.removeItem('token');
            localStorage.removeItem('userDetails');
            console.log('In reducer logout');
            return{
                ...state,
                isAuth: false,
                userDetails: null,
                token: null
            }

        default:
            return state;
    }
}

export default reducer;