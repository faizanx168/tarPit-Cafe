const express = require('express');
const mongoose = require('mongoose');
const Products = require('../models/Product')

router.get('/', asyncError(async (req, res)=>{
    const products = await Products.find({});
    res.render('tarpitCafe/index', {products});
}))

router.get('/new', (req, res)=>{
    res.render('tarpitCafe/new');
})
router.post('/',upload.array('image'), asyncError(async(req, res)=>{
    const products = new Products(req.body.products);
    products.image = req.files.map(file => ({
        url: file.path, filename: file.filename
    }));
    await products.save();
    req.flash('success', 'Successfully create a new products')
    res.redirect(`/tarpitCafe/${products._id}`);
}))

router.get('/:id', asyncError(async (req, res)=>{
    const {id} = req.params;
    const products = await Products.findById(id);
    if(!products) {
        req.flash('error', 'Sorry! Campground not found');
        return res.redirect('/tarpitCafe');
    }
    res.render('tarpitCafe/show', {products});
}))

router.get('/:id/edit', asyncError(async (req, res)=>{
    const {id} = req.params;
    const products = await Products.findById(id);
    if(!products) {
        req.flash('error', 'Sorry! Campground not found');
        return res.redirect('/tarpitCafe');
    }
    res.render('tarpitCafe/edit', {products});
}))
router.put('/:id',upload.array('image'), asyncError(async (req,res)=>{
    const {id} = req.params;
    console.log(req.body);
    const products = await Camp.findByIdAndUpdate(id, { ...req.body.products });
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
    res.redirect(`/tarpitCafe/${products._id}`);
}))

router.delete('/:id', isLoggedIn, asyncError(async (req,res)=>{
    const {id} = req.params;
    await Camp.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the products")
    res.redirect('/tarpitCafe');
}))

module.exports = router;