const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Security = require('../utils/Security');
const Cart = require('../utils/cart');
const Products = require('../models/Product');
const asyncError = require('../utils/AsyncError.js');
// const { json } = require('body-parser');

router.get('/cart', (req, res) => {
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    console.log(cart)
    res.render('tarpit/cart', {
        pageTitle: 'Cart',
        cart: cart,
        nonce: Security.md5(req.sessionID + req.headers['user-agent'])
    });
});

router.get('/cartdata', (req, res)=>{
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    res.json(cart);
})

router.get('/checkout',(req,res)=>{
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    console.log('checkout' ,cart)
    res.render('tarpit/checkout', {
        pageTitle: 'Checkout',
        cart: cart,
        checkoutDone: false,
        nonce: Security.md5(req.sessionID + req.headers['user-agent'])
    });
})

router.put('/cartdata',asyncError(async (req, res) =>{
    req.session.cart =  req.body.data
    await req.session.save();
    // req.session.cart.reload();
    res.end();
}))

router.post('/cart',asyncError(async(req, res) => {
    let qty = parseInt(req.body.qty, 10);
    // console.log(qty);
    let product = req.body.product_id;
    // let format = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
    if(qty > 0 && Security.isValidNonce(req.body.nonce, req)) {
        const mypro = await Products.findOne({_id: product})
            let cart = (req.session.cart) ? req.session.cart : null;
            const prod = {
                id: mypro._id,
                title: mypro.title,
                price: mypro.price,
                qty: qty,
                image: mypro.image[0].url,
            }
            // res.send(prod)
            Cart.addToCart(prod, qty, cart);
            res.redirect('/cart');

    } 
    else {
        res.redirect('/');
    }
}));

router.post('/checkout', (req, res)=>{
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    if(Security.isValidNonce(req.body.nonce, req)) {
        res.render('tarpit/checkout', {
            pageTitle: 'Checkout',
            cart: cart,
            checkoutDone: true
        });
    } else {
        res.redirect('/');
    }
})

module.exports = router;