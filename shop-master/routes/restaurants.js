var express = require('express');
var router = express.Router();
const model = require('../models/Restaurant');
const mongoose = require('mongoose');

const {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    editRestaurant,
    deleteRestaurant,
    getRestaurantsByCategory,
    getRestaurantByOwner
} = require ('../controllers/restaurants');

router.get('/', getRestaurants);
router.get('/owner', getRestaurantByOwner);
router.get('/:restaurantID', getRestaurant);
router.post('/', createRestaurant);
router.put('/:restaurantID', editRestaurant);
router.delete('/:restaurant', deleteRestaurant);
router.get('/categories/:category', getRestaurantsByCategory);

module.exports = router;