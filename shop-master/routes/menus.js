var express = require('express');
var router = express.Router();
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

const {
    getMenu, createMenu, editMenu, deleteMenu, getMenusByRestaurant,
} = require ('../controllers/menus');

router.get('/:menuID', getMenu);
router.post('/', createMenu);
router.put('/:menuID', editMenu);
router.delete('/:menuID', deleteMenu);
router.get('/restaurants/:restaurantID', getMenusByRestaurant);


module.exports = router;