const { v4: uuidv4 } = require('uuid');
const fs = require('fs')
const HttpError = require('../utils/http-error');
const {validationResult} = require("express-validator");

const getCoordsForAddress = require('../utils/location')
const mongoose = require('mongoose')
const Place = require('../models/places.models')
const User = require('../models/users.models')


// let DUMMY_PlACES = [{
    
//     id: 'p1',
//     title: 'Empier State Building' ,
//     description: 'One of the most famous sky scrapers in the world!',

//     location: {
//         lat: 40.7484474,
//         lng: -73.9871516,
//     },

//     addresses: '20Q 34th St, New York , NY 10001',
//     creator: 'u1'
    
// }];



const getPlaceById = async (req , res , next)=> {
    const placeId = req.params.pid;  // {pid : 'p1}

    let place;
    try {
         place = await Place.findById(placeId);
    } catch (error) {
        throw new HttpError(error , 500)
    }


    // const place = DUMMY_PlACES.find(p=> {
    //     return p.id === placeId
    // })

    if(!place) {
        // return res
        // .status(404)
        // .json({message : 'Could Not find a place for the provide id.'})

        // const error = new Error('Could not find a place for the provided id')
        // error.code = 404;
        // throw error;
        const error = new HttpError('Could not find a place for the provided id.' , 404)

        return next(error)
    }
    res.json({place: place.toObject({getters:true})});  // => {place} => {place: place}
};

const getPlacesByUserId = async (req ,res , next) => {
    const userId = req.params.uid;

    // const places = DUMMY_PlACES.filter( p => {
    //     return p.creator === userId;
    // })
    // let places
    // try {
    //      places = await Place.find({creator: userId})
    // } catch (err) {
    //     const error = new HttpError('unable to fetch' , 500)
    //     return next(error)
    // }

    let userWithPlaces

    try {
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        const error = new HttpError('unable to fetch' , 500)
    //     return next(error)
    }

    if(!userWithPlaces || userWithPlaces.places.length === 0) {
        //  const error = new Error('Could not find a place for the provided user id')
        // error.code = 404;
        // next(error);
        const error = new Error();
        error.code = 404 ;
        return next(new HttpError('Could not find the place for the provided user id ' , 404))
    }

    res.json({places: userWithPlaces.places.map(place => place.toObject({getters:true}))})
};

const createPlace =  async (req , res , next)=> {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
       return  next (new HttpError('Invalid inputs passed , please check yout data.', 422))
    }


    const { title , description , address  } = req.body ;

    let coordinates;
    
    try {
         coordinates = await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }


    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator :req.userData.userId
    })

    let user;

    try {
        user = await User.findById(creator)
    } catch (error) {
        const err = new HttpError(
            'Creating place failed , please try again' ,
            500 
        )
    }

    if(!user) {
        const error = new HttpError('Could not find user for provided id' , 404)
    }

    console.log(user);
    
    try {
  const sess = await mongoose.startSession();
  sess.startTransaction();

 
  await createdPlace.save({ session: sess });

  user.places.push(createdPlace);
  await user.save({ session: sess });

  await sess.commitTransaction();
} catch (error) {
  const err = new HttpError(
    'Creating place failed, please try again.',
    500
  );
  
  return next(err);
}

    
    // DUMMY_PlACES.push(createdPlace);

    res.status(201).json({place : createdPlace})
}

const updatePlace = async (req , res , next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors)
        throw new HttpError('Invalid inputs passed , please check yout data.', 422);
    }


    const {title , description } = req.body

    const placeId = req.params.pid
    
    let place ;

    try {
        place = await Place.findById(placeId)
    } catch (error) {
        return next( new HttpError('Couldnt update',500))
    }

    place.title = title ;
    place.description = description;

   try {
    await place.save()
   } catch (error) {
    return next(new HttpError('could not update the place' , 500))
   }


   if(place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place' , 401))
   }

    res.status(200).json({place: place.toObject({getters:true})})

}

const deletePlace = async(req , res , next) => {
    const placeId = req.params.pid
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (error) {
        return next(new HttpError('couldnt delete',500))
    }

    if(place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to delete this place' , 403))
   }

    const imagePath = place.image

    try {
       const sess = await mongoose.startSession();
       sess.startTransaction();
       await place.deleteOne({session : sess});
       place.creator.places.pull(place);
       await place.creator.save({session : sess});
       await sess.commitTransaction();  
    } catch (error) {
         return next(new HttpError(' someting went wrong ,couldnt delete place',500))
        
    }

    fs.unlink(imagePath, err=> {
        console.log(err);
    })


    // try {
    //    await place.remove();
    // } catch (error) {
    //      return next(new HttpError('couldnt delete',500))
    // }

    res.status(200).json({message:'Deleted place'})
}

exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId= getPlacesByUserId;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace