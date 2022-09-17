const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const aboutSchema = new Schema({
    employeeName: String,
    employeeDes: String,
    image: [
        {
            url: String,
            filename:String
        }
    ],
 });

 module.exports = mongoose.model('About', aboutSchema);