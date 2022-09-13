const express = require('express');
const router = express.Router({mergeParams: true});
const myError = require('../utils/ExtendedError');
const asyncError = require('../utils/AsyncError.js');
const User = require('../models/user');
const passport = require('passport');
const { Session } = require('express-session');


router.get('/register', (req, res)=>{
    res.render('users/registration');
})
router.post('/register', asyncError(async (req, res)=>{
 try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registered = await User.register(user, password);
    req.login(registered, function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Welcome to Tarpit!');
        res.redirect('/');
      });
 }
 catch(err){
    req.flash('error', err.message);
    res.redirect('/register')
 }
}))

router.get('/login', (req, res)=>{
    res.render('users/login');
})
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login',keepSessionInfo: true,}), (req, res)=>{
    req.flash('success', 'Successfully logged in, enjoyy!');
    res.redirect('/');
})
router.get('/logout', (req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'Successfully logged out!');
          res.redirect('/');
      });
   
})

module.exports = router;