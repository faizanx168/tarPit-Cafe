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



router.get('/', asyncError(async (req, res)=>{
    const products = await Product.find({});
    res.render('tarpit/index', {products});
    // res.send('it worked')
}))

router.get('/new',isLoggedIn, isAdmin, (req, res)=>{
    res.render('tarpit/new');
})
router.post('/',isLoggedIn, isAdmin,  upload.array('image'),validateProduct, asyncError(async(req, res)=>{
    const newProduct = new Product(req.body.product);
    console.log('asfeacascacacac',newProduct)
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
    const {id} = req.params;
    const products = await Product.findById(id).populate({
        path: 'review',
        populate: {
            path: 'author',
            path: 'comments'
        }
    })
    // res.send(review.author)
    if(!products) {
        req.flash('error', 'Sorry! Product not found');
        return res.redirect('/products');
    }
    console.log(products);
    res.render('tarpit/show', {products});
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