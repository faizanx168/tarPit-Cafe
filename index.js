if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const method = require('method-override');
const Register = require('./routes/user.js');
const Tarpit = require('./routes/products')
const Reviews = require('./routes/reviews');
const myError = require('./utils/ExtendedError');
const passport = require('passport');
const localPass = require('passport-local');
const User = require('./models/user');
const About = require('./routes/about')
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash');


mongoose.connect('mongodb://localhost:27017/tarpit', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended: true}));
app.use(method('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'asdffgkhlkhlkfph',
    resave: false,
    saveUninitialized: true, 
    cookie:{
        expires: Date.now() + 1000 * 60 *60 * 24,
        httpOnly: true,
        maxAge: 1000 * 60 *60 * 24 * 2,
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPass(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', Register );
app.use('/about', About )
app.use('/products', Tarpit);
app.use('/products/:id/reviews', Reviews)
app.get('/', (req,res)=>{
    res.render('tarpit/home');
})


app.all('*',(req, res, next)=>{
    next(new myError('Page not found', 404))
})

app.use((err, req, res, next) =>{
    const {status = 500} = err;
    if(!err.message) err.message = 'Oh No, There was an error!!'
    res.status(status).render('error' , {err});
} )
app.listen(3000, ()=>{
    console.log("Listening to port 3000"); 
})