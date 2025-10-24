const { v4: uuidv4 } = require('uuid');
const HttpError = require('../utils/http-error')
const {validationResult} = require("express-validator"); 
const User = require('../models/users.models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// let DUMMY_USERS = [
//     {
//         id: 1 ,
//         name : 'Giyan' ,
//         email: 'mehugiyan@gmail.com',
//         password: "iloveyou",

//     }
// ];

const getUsers = async (req , res , next) => {
   let users;
   try {
    users = await User.find({}, '-password');
   } catch (err) {
    const error = new HttpError(
        'Fetching users failed , please try again later.',
        500
    )
    return next(error)
   }

   res.json({users: users.map(user => user.toObject({getters:true}))})
};

const signup = async (req , res , next) => {
    const errors = validationResult(req);
        if(!errors.isEmpty()) {
            
            return next( new HttpError('Invalid inputs passed , please check yout data.', 422))
        }
    const { name ,  email , password } = req.body;

    let existingUser
     try {
        existingUser = await User.findOne({email : email})
     } catch (error) {
        const err = new HttpError('Signing up failed , please try again ' , 500)

        return next(err)
     }


     if(existingUser){
        const error = new HttpError(
            'User exists already , please login instead',401
        )
        return next(error)
     }

     let hashedPassword 
     try {
        hashedPassword = await bcrypt.hash(password,12)
     } catch (err) {
        const error = new HttpError('Could not create user , please try again' , 
            500
        )

        return next(error)
     }



    // const hasUser = DUMMY_USERS.find((u) => u.email === email);

    // if (hasUser) {
    //     throw new HttpError('Could not create user, email already exists.', 422);
    // }

    const createUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places : []
    })
    // DUMMY_USERS.push(createUser)

    try {
        await createUser.save();
    } catch (err) {

        const error = new HttpError('Signing up failed , please try again ' , 500)

        return next(error)
        
    }

         //token genration 
     let token 
     try {
        token = jwt.sign({userId: createUser.id , email: createdUser.email},
           'SECRET_KEY',
           {expiresIn: '1h'}
        )
     } catch (err) {

        const error = new HttpError(
            'signiong up failed m please try again later' ,
            500
        )
        return next(error)
     }

    res.status(201).json({user: createUser.id , email: createdUser.email , token: token});
};

const login = async (req , res , next) => {
    const{email , password} = req.body

    let existingUser
     try {
        existingUser = await User.findOne({email : email})
     } catch (error) {
        const err = new HttpError('Logging in failed , please try again later. ' , 500)

        return next(err)
     }

     if(!existingUser) {
        const error = new HttpError (
            'Invalid credentials , could not log in you',
            403
        )

        return next('error')
     }

     let isValidPassword = false;
     try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
     } catch (err) {
        const error = new HttpError('Could not log you in , please check your credentials and try again' ,
            500
        )
        return next(error)
     }

     if(!isValidPassword) {
        const error = new HttpError (
            'Invalid credentials , could not log in you',
            403
        )
        return next('error')
     }

     let token 
     try {
        token = jwt.sign({userId: existingUser.id , email: existingUser.email},
           'SECRET_KEY',
           {expiresIn: '1h'}
        )
     } catch (err) {

        const error = new HttpError(
            'logging in failed m please try again later' ,
            500
        )
        return next(error)
        
     }

     res.json({
        userId: existingUser.id ,
        email: existingUser.email,
        token:token
     })
     

    // const identifiedUser = DUMMY_USERS.find((p)=> p.email === email)
    // if(!identifiedUser || identifiedUser.password != password) {
    //     throw new HttpError('Could not identy user , Invalid credentials' , 401)
    // }
    };

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
