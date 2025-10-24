const HttpError = require("../utils/http-error")
const jwt = require('jsonwebtoken')
module.exports= (req , res , next) => {
    if(req.method === 'OPTIONS'){
        return next();
    }

   try {
     const token = req.headers.authorization.split(' ')[1] //Authorization : 'Bearer token'
     if(!token){
        throw new Error('Authentication failed')
     }
    
     const decodedtoken =jwt.verify(token , 'SECRET_KEY')
     req.userData = {userId: decodedtoken.userId}
   } catch (err) {
    const error = new HttpError('Authentication failed' ,
            403
        )
        return next(error)
   }
    
}