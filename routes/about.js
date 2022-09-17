const express = require('express');
const mongoose = require('mongoose');
const router = express.Router({mergeParams: true});
const asyncError = require('../utils/AsyncError.js');
const multer = require('multer');
const { storage } = require('../utils/cloudinary-config');
const upload = multer({storage});
const { isAdmin, isLoggedIn } = require('../utils/Middleware');
const Employee = require('../models/employee')

router.get('/',asyncError(async(req, res)=>{
    const employee = await Employee.find({});
    res.render('about/about', {employee});
}))

router.get('/new',isLoggedIn, isAdmin, asyncError(async(req, res)=>{
    res.render('about/new');
}))
router.post('/',isLoggedIn, isAdmin,upload.array('image'), asyncError(async(req, res)=>{
    const employee = new Employee(req.body.about)
    employee.image = req.files.map(file => ({
        url: file.path, filename: file.filename
    }));
    await employee.save();
    req.flash('success', 'Successfully create a new products')
    res.redirect('/about');
}))

// router.get('/:id', asyncError(async (req, res)=>{
//     const {id} = req.params;
//     res.send("huuu")
// }))

// router.get('/:id/edit',isLoggedIn, isAdmin, asyncError(async (req, res)=>{
//     const {id} = req.params;
//     const products = await Product.findById(id);
//     if(!products) {
//         req.flash('error', 'Sorry! Product not found');
//         return res.redirect('/');
//     }
//     res.render('tarpit/edit', {products});
// }))
// router.put('/:id',isLoggedIn, isAdmin, upload.array('image'),validateProduct, asyncError(async (req,res)=>{
//     const {id} = req.params;
//     // console.log(req.body);
//     const products = await Product.findByIdAndUpdate(id, {...req.body.product});
//     images = req.files.map(file => ({
//         url: file.path, filename: file.filename
//     }));
//     products.image.push(...images);
//     if(req.body.deleteImage){
//         for(let file of req.body.deleteImage){
//            await cloudinary.uploader.destroy(file);
//         }
//        await products.updateOne({$pull: {image: {filename:{$in: req.body.deleteImage }}}});
//     }
//     await products.save();
//     req.flash('success', "Successfully edited the products")
//     res.redirect(`/products/${products._id}`);
// }))

// router.delete('/:id',isLoggedIn, isAdmin, asyncError(async (req,res)=>{
//     const {id} = req.params;
//     const product = await Product.findByIdAndDelete(id);
//     req.flash('success', "Successfully deleted the products")
//     res.redirect('/products');
// }))

module.exports = router;