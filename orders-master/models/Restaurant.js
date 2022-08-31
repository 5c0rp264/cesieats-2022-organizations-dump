const mongoose = require('mongoose');

const categories = ['asiatique', 'healthy', 'gastronomique', 'bistronomique'];

module.exports = mongoose.model('restaurants', new mongoose.Schema({
    category: {type: String, enum:categories},
    name: {type: String, required: true},
    description: {type: String},
    owner: {type: Number, required: true},
    isOpen: {type: Boolean, required: true},
    image: {type: String},
})); 