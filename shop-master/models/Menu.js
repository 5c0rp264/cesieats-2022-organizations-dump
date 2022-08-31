const mongoose = require('mongoose');

module.exports = mongoose.model('menus', new mongoose.Schema({
    restaurant: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String},
    articles: [{
        _id: {type: String, required: true},
        name: {type: String, required: true},
        price: {type: Number, required: true},
        type: {type: String, required: true},
        category: {type: String},
        description: {type: String},
        image: {type: String},
    }],
    image: {type: String},
}));