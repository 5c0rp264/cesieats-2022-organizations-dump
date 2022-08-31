const mongoose = require('mongoose');

/* TODO : complete model */
module.exports = mongoose.model('orders', new mongoose.Schema({
    client: {
        _id: {type: String, required: true},
        name: {type: String, required: true},
        address: {type: String, required: true},
    },
    restaurant: {
        _id: {type: String, required: true},
        name: {type: String, required: true},
    },
    deliverer: {
        _id: {type: String},
        name: {type: String},
        vehicle: {type: String, enum:['scooter', 'car', 'bicycle']},
    },
    timestamp: {type: Date, required: true},
    isPaid: {type: Boolean, required: true},
    price: {type: Number, required: true},
    menus: [{
        _id: {type: String, required: true},
        name: {type: String, required: true},
        description: {type: String},
        price: {type: Number, required: true},
        count: {type: Number, required: true},
        articles: [{
            _id: {type: String, required: true},
            name: {type: String, required: true},
            price: {type: Number, required: true},
            type: {type: String, required: true},
            category: {type: String},
        }],
    }],
    articles: [{
        _id: {type: String, required: true},
        name: {type: String, required: true},
        price: {type: Number, required: true},
        price: {type: Number, required: true},
        type: {type: String, required: true},
    }],
    status: [{
        name: {type: String, enum:['created', 'validated', 'assigned', 'indelivery', 'delivered', 'paid'], required: true},
        timestamp: {type: Date, required: true},
    }]
}));