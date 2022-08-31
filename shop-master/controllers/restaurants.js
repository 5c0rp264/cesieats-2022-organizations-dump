const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const model = require('../models/Restaurant');

const getRestaurants = async function (req, res) {
    try {
        const restaurants = await model.find().exec();
        res.status(200).json({"restaurants": restaurants});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des restaurants. Merci de réessayer plus tard."});
    }
};

const getRestaurant = async function (req, res) {
    try {
        const restaurant = await model.findOne({_id: new mongoose.Types.ObjectId(req.params.restaurantID)}).exec();
        res.status(200).json({"restaurant": restaurant});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'un restaurant. Merci de réessayer plus tard."});
    }
};

const getRestaurantByOwner = async function (req, res) {
    try {
        const restaurant = await model.findOne({owner: JSON.parse(req.headers.user).uid}).exec();
        res.status(200).json({restaurant});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'un restaurant. Merci de réessayer plus tard."});
    }
};

const createRestaurant = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        const restaurant = new model({
            category: req.body.category,
            name: req.body.name,
            description: req.body.description,
            owner: req.body.user,
            isOpen: false,
            image: req.body.image,
        });
        try {
            const savedRestaurant = await restaurant.save();
            res.status(201).json({"restaurant": savedRestaurant});
        } catch (error) {
            res.status(400).json({"error": "Erreur lors de la sauvegarde d'un restaurant. Merci de réessayer plus tard."+error.toString()});
        }
    } else {
        res.sendStatus(403);
    }
};

const editRestaurant = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {
            let restaurant = await Restaurant.findOne({_id: new mongoose.Types.ObjectId(req.body.restaurant)}).exec();
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                try {
                    const restaurant = await model.updateOne({_id: new mongoose.Types.ObjectId(req.params.restaurantID)}, {
                        category: req.body.category,
                        name: req.body.name,
                        description: req.body.description,
                        isOpen: req.body.isOpen,
                        image: req.body.image,
                    });
            
                    restaurant !== null ? res.status(203).json(restaurant) : res.sendStatus(404);
                } catch (error) {
                    res.status(404).json({"error": "Erreur lors de la mise à jour d'un restaurant. Merci de réessayer plus tard."});
                }
            } else {                
                res.sendStatus(403);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(403);
    }
};

const deleteRestaurant = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {
            let restaurant = await Restaurant.findOne({_id: new mongoose.Types.ObjectId(req.body.restaurant)}).exec();
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                try {
                    const restaurant = await model.findOneAndRemove({_id: new mongoose.Types.ObjectId(req.params.restaurantID)}).exec();
                    restaurant !== null ? res.sendStatus(204) : res.sendStatus(404);
                } catch (error) {
                    res.status(400).json({"error": "Erreur lors de la suppression d'un restaurant. Merci de réessayer plus tard."});
                }
            } else {
                res.sendStatus(403);
            }
        } catch (error) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(403);
    }
};

const getRestaurantsByCategory = async function (req, res) {
    try {
        const restaurants = await model.find({category: req.params.category}).exec();
        res.status(200).json({"restaurants": restaurants});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des restaurants. Merci de réessayer plus tard."});
    }
};

module.exports = {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    editRestaurant,
    deleteRestaurant,
    getRestaurantsByCategory,
    getRestaurantByOwner
}