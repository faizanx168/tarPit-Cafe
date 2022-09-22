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

// router.get('/cart/remove/:id/:nonce', (req, res) => {
//     let id = req.params.id;
//     if(/^\d+$/.test(id) && Security.isValidNonce(req.params.nonce, req)) {
//         Cart.removeFromCart(parseInt(id, 10), req.session.cart);
//         res.redirect('/cart');
//     } else {
//         res.redirect('/');
//     }
//  });
 
// router.get('/cart/empty/:nonce', (req, res) => {
//      if(Security.isValidNonce(req.params.nonce, req)) {
//          Cart.emptyCart(req);
//          res.redirect('/cart');
//      } else {
//          res.redirect('/');
//      }
//  });
router.get('/cartdata', (req, res)=>{
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    res.json(cart);
})
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
            console.log(cart)
            // res.send(cart)
            res.redirect('/cart')
    } 
    else {
        // res.redirect('/');
    }
}));
router.post('/cart/update', (req, res) => {
    res.send(req.body)
    // let ids = req.body;
    // console.log(ids)
    // let qtys = req.body["qty[]"];
    // console.log(qtys)
    // if(Security.isValidNonce(req.body.nonce, req)) {
    //     let cart = (req.session.cart) ? req.session.cart : null;
    //     let i = (!Array.isArray(ids)) ? [ids] : ids;
    //     let q = (!Array.isArray(qtys)) ? [qtys] : qtys;
    //     Cart.updateCart(i, q, cart);
    //     res.redirect('/cart');
    // } else {
    //     res.redirect('/');
    // }
});
module.exports = router;