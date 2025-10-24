const express = require('express');
const placeControllers = require('../controllers/places.controllers')
const {check} = require('express-validator');
const fileUpload = require('../middlewares/multer.middlewares')
const auth = require('../middlewares/auth.middlewares')
const router = express.Router();



router.get('/:pid', placeControllers.getPlaceById );

router.get('/user/:uid' , placeControllers.getPlacesByUserId)

router.use(auth);

router.post('/' ,

    fileUpload.single('image'),


    [
        check('title')
        .not()
        .isEmpty() ,

     check('description').isLength({min : 5}),

     check('address')
         .not()
         .isEmpty()

    ] ,
    placeControllers.createPlace);

router.patch('/:pid' , [
    check('title')
    .not()
    .isEmpty() ,

    check('description').isLength({min : 5})

] , placeControllers.updatePlace)

router.delete('/:pid' , placeControllers.deletePlace)

module.exports = router;