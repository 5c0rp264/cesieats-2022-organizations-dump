const mongoose = require('mongoose');

module.exports = mongoose.model('articles', new mongoose.Schema({
    _id: {type: mongoose.SchemaTypes.ObjectId, required: true, unique: true},
    category: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String},
}));