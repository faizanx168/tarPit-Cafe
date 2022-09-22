const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({mergeParams: true});
const asyncError = require('../utils/AsyncError.js');
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../utils/cloudinary-config');
const upload = multer({storage});
const { cloudinary } = require('../utils/cloudinary-config');
const { isAdmin, validateProduct, isLoggedIn } = require('../utils/Middleware');
const user = require('../models/user.js');
const Security = require('../utils/Security');
const Comment = require('../models/comments')

router.get('/', asyncError(async (req, res)=>{
    let filter ={};
    if (req.query.query){
        filter = {category: req.query.query};
        console.log(filter)
    }
    // console.log(filter)
    // console.log(req.sessionID, req.headers['user-agent'])
    const products = await Product.find(filter); 
    // const nonce =  Security.md5(req.sessionID + req.headers['user-agent'])
    res.render('tarpit/index', {
        pageTitle: 'Shop',
        products: products
        // nonce: nonce
    });
    
}))
// router.get('/data', asyncError(async (req, res)=>{
//     let filter ={};
//     if (req.query.categories){
//         filter = {categories: req.query.categories.split(',')};
//     }
//     const products = await Product.find(filter); 
//     res.json(products);
//     // res.send(products);
//     // res.render;
// }))

router.get('/new',isLoggedIn, isAdmin, (req, res)=>{
    res.render('tarpit/new');
})
router.post('/',isLoggedIn, isAdmin,  upload.array('image'),validateProduct, asyncError(async(req, res)=>{
    const newProduct = new Product(req.body.product);
    // console.log('asfeacascacacac',newProduct)
    // res.send(req.body,req.files)
    newProduct.image = req.files.map(file => ({
        url: file.path, filename: file.filename
    }));
    await newProduct.save();
    req.flash('success', 'Successfully create a new products')
    res.redirect(`/products/${newProduct._id}`);
    // console.log('it Worked')
    // res.send('req.body.product');
}))

router.get('/:id', asyncError(async (req, res)=>{
    if(!req.session.cart) {
        req.session.cart = {
            items: [],
            totals: 0.00,
            formattedTotals: ''
        };
        console.log(req.session.cart)
    }
    const {id} = req.params;
    const products = await Product.findById(id).populate({
        path: 'review',
        populate: {
            path: 'author'
        }
    })
    let comments = [];
    // console.log(products.review.length)
    // console.log(products.review[2]._id)
    for(i = 0; i < products.review.length; i++){
    comments = await Comment.find( {review: { _id :products.review[i]._id}}).populate('review')
    }
//    console.log('my comments',comments)
   
    if(!products) {
        req.flash('error', 'Sorry! Product not found');
        return res.redirect('/products');
    }
    const nonce =  Security.md5(req.sessionID + req.headers['user-agent'])
    res.render('tarpit/show', {
        pageTitle: `${products.title}`,
        products,
        comments,
        nonce
    });
}))

router.get('/:id/edit',isLoggedIn, isAdmin, asyncError(async (req, res)=>{
    const {id} = req.params;
    const products = await Product.findById(id);
    if(!products) {
        req.flash('error', 'Sorry! Product not found');
        return res.redirect('/');
    }
    res.render('tarpit/edit', {products});
}))
router.put('/:id',isLoggedIn, isAdmin, upload.array('image'),validateProduct, asyncError(async (req,res)=>{
    const {id} = req.params;
    // console.log(req.body);
    const products = await Product.findByIdAndUpdate(id, {...req.body.product});
    images = req.files.map(file => ({
        url: file.path, filename: file.filename
    }));
    products.image.push(...images);
    if(req.body.deleteImage){
        for(let file of req.body.deleteImage){
           await cloudinary.uploader.destroy(file);
        }
       await products.updateOne({$pull: {image: {filename:{$in: req.body.deleteImage }}}});
    }
    await products.save();
    req.flash('success', "Successfully edited the products")
    res.redirect(`/products/${products._id}`);
}))

router.delete('/:id',isLoggedIn, isAdmin, asyncError(async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the products")
    res.redirect('/products');
}))

module.exports = router;