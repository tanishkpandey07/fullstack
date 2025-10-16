const { v4: uuidv4 } = require('uuid');
const HttpError = require('../utils/http-error')
const {validationResult} = require("express-validator"); 
const User = require('../models/users.models')


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
            'User exists already , please login instead',422
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
        image: "ggg",
        password,
        places : []
    })
    // DUMMY_USERS.push(createUser)

    try {
        await createUser.save();
    } catch (err) {

        const error = new HttpError('Signing up failed , please try again ' , 500)

        return next(error)
        
    }

    res.status(201).json({user: createUser.toObject({getters:true})});
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

     if(!existingUser || existingUser.password !== password) {
        const error = new HttpError (
            'Invalid credentials , could not log in you',
            401
        )
     }

    // const identifiedUser = DUMMY_USERS.find((p)=> p.email === email)
    // if(!identifiedUser || identifiedUser.password != password) {
    //     throw new HttpError('Could not identy user , Invalid credentials' , 401)
    // }
    res.json({ message: 'Logged in!' });};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
