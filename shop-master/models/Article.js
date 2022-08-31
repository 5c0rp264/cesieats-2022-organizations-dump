const mongoose = require('mongoose');

module.exports = mongoose.model('articles', new mongoose.Schema({
    restaurant: {type: String, required: true},
    type: {type: String, enum:['Plat', 'Boisson', 'Sauce', 'Accompagnement'], required: true},
    category: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String},
    image: {type: String},
})); 