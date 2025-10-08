const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./utils/http-error')
const placesRoutes = require('./routes/place.routes')
const usersRoutes= require('./routes/users.routes')

const connectDB = require('./configs/db.configs')


require('dotenv').config()




const app = express();

app.use(bodyParser.json());

app.use( '/api/places',placesRoutes);
app.use('/api/users', usersRoutes);


app.use((req , res ,next)=>{
    throw new HttpError('Could not find the routes' , 404);
})

//error handler middleware
app.use((error , req , res , next) => {
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
        .json({message : error.message || 'An unkown error occured '})
})


//connecting database and PORT
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!", error)
})

