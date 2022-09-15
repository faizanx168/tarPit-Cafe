const joi = require('joi');

module.exports.productSchema = joi.object({
    product: joi.object({
        title: joi.string().required(),
        price: joi.number().required().min(0),
        description: joi.string().required()
    }).required(),
    deleteImage: joi.array()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        body: joi.string().required()
    }).required()
});