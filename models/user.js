const mongoose = require('mongoose');
const passortLocal = require('passport-local-mongoose');
const Schema = mongoose.Schema; 

 const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
 });

 UserSchema.plugin(passortLocal);
 module.exports = mongoose.model('User', UserSchema);