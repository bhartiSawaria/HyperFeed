
const jwt = require('jsonwebtoken');

const SECRET = 'mySecret';

module.exports = (req, res, next) => {
    const authorized = req.get('Authorization');
    if(authorized){  
        const token = authorized.split(' ')[1];
        let decodedToken;
        try{
            decodedToken = jwt.verify(token, SECRET);
        }catch(err){
            console.log('Error in decoding token.', err);
            throw err;
        }
        if(!decodedToken){
            const error = new Error('User is not authorized.');
            error.setStatus = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    }
    else{
        const error = new Error('User is not authorized.');
        error.setStatus = 401;
        throw error;
    }
}