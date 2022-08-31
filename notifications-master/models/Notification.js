const mongoose = require('mongoose');
mongoose.set('debug', true);


/* TODO : complete model */
module.exports = mongoose.model('notification', new mongoose.Schema({
    _id: {type: mongoose.SchemaTypes.ObjectId, required: true, unique: true},
    content: {type: String, required: true, unique: false},
    user_id: {type: Number, required: true, unique: false},
    timestamp: {type: Date, default: Date.now, unique: false},
    wasRead: {type: Boolean, default: false, unique: false},
}));