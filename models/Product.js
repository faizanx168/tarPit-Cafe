const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const productSchema = new Schema({
    title: String,
    image: [
        {
            url: String,
            filename:String
        }
    ],
    price: Number,
    description: String
});

module.exports = mongoose.model('Product', productSchema);
