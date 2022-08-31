const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

const getMenu = async function (req, res) {
    try {
        const menu = await Menu.findOne({_id: new mongoose.Types.ObjectId(req.params.menuID)}).exec();
        res.status(200).json({"menu": menu});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'un menu. Merci de réessayer plus tard."});
    }
};

const createMenu = async function (req, res) {

    if(JSON.parse(req.headers.user).role === 'restaurant') {

        try {

            let restaurant = await Restaurant.findOne({_id: new mongoose.Types.ObjectId(req.body.restaurant)}).exec();
            console.log(req.body.articles);
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                const menu = new Menu({
                    restaurant: req.body.restaurant,
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    articles: JSON.parse(req.body.articles),
                    image: req.body.image,
                });
            
                try {
                    const savedMenu = await menu.save(); 
                    res.status(201).json({"menu": savedMenu});
                } catch (error) {
                    console.log(error);
                    res.status(400).json({"error": "Erreur lors de la sauvegarde d'un menu. Merci de réessayer plus tard."});
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

const editMenu = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {

            let restaurant = await Restaurant.findOne({_id: new mongoose.Types.ObjectId(req.body.restaurant)}).exec();
            console.log(restaurant);
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                try {
                    console.log("menu :" + req.params.menuID);
                    const menu = await Menu.updateOne({_id: new mongoose.Types.ObjectId(req.params.menuID)}, {
                        name: req.body.name,
                        price: req.body.price,
                        description: req.body.description,
                        articles: JSON.parse(req.body.articles),
                        image: req.body.image,
                    });
                    menu !== null ? res.status(200).json(menu) : res.sendStatus(404);
                } catch (error) {
                    console.log(error);
                    res.status(404).json({"error": "Erreur lors de la mise à jour d'un menu. Merci de réessayer plus tard."});
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

const deleteMenu = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {
            let restaurant = await Restaurant.findOne({owner: JSON.parse(req.headers.user).uid}).exec();
            const menu = await Menu.findOne({_id: new mongoose.Types.ObjectId(req.params.menuID)}).exec();
            if(String(restaurant._id) === menu.restaurant) {
                try {
                    const menu = await Menu.findOneAndRemove({_id: new mongoose.Types.ObjectId(req.params.menuID)}).exec();
                    menu !== null ? res.sendStatus(204) : res.sendStatus(404);
                } catch (error) {
                    res.status(400).json({"error": "Erreur lors de la suppression d'un menu. Merci de réessayer plus tard."});
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
}

const getMenusByRestaurant = async function (req, res) {
    try {
        const menus = await Menu.find({restaurant: req.params.restaurantID}).exec();
        res.status(200).json({"menus": menus});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des menus. Merci de réessayer plus tard."});
    }
}

module.exports = {
    getMenu,
    createMenu,
    editMenu,
    deleteMenu,
    getMenusByRestaurant,
}