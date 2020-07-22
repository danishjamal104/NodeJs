const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    admin:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);