const Article = require('../models/Article');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

const getArticle = async function (req, res) {
    try {
        const article = await Article.findOne({_id: new mongoose.Types.ObjectId(req.params.articleID)}).exec();
        res.status(200).json({"article": article});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'un article. Merci de réessayer plus tard."});
    }
};

const createArticle = async function (req, res) {

    if(JSON.parse(req.headers.user).role === 'restaurant') {

        try {
            let restaurant = await Restaurant.findOne({owner: JSON.parse(req.headers.user).uid}).exec();
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                const article = new Article({
                    restaurant: restaurant._id,
                    type: req.body.type,
                    category: req.body.category,
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                    image: req.body.image,
                });
             
                try {
                    const savedArticle = await article.save();
                    res.status(201).json({"article": savedArticle});
                } catch (error) {
                    res.status(400).json({"error": "Erreur lors de la sauvegarde d'un article. Merci de réessayer plus tard."});
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

const editArticle = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {
            let restaurant = await Restaurant.findOne({_id: new mongoose.Types.ObjectId(req.body.restaurant)}).exec();
            if(restaurant !== null && JSON.parse(req.headers.user).uid === Number(restaurant.owner)) {
                try {
                    const article = await Article.updateOne({_id: new mongoose.Types.ObjectId(req.params.articleID)}, {
                        type: req.body.type,
                        category: req.body.category,
                        name: req.body.name,
                        price: req.body.price,
                        description: req.body.description,
                        image: req.body.image,
                    });
            
                    article !== null ? res.status(203).json(article) : res.sendStatus(404);
                } catch (error) {
                    res.status(404).json({"error": "Erreur lors de la mise à jour d'un article. Merci de réessayer plus tard."});
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

const deleteArticle = async function (req, res) {
    if(JSON.parse(req.headers.user).role === 'restaurant') {
        try {
            let restaurant = await Restaurant.findOne({owner: JSON.parse(req.headers.user).uid}).exec();
            if(restaurant !== null && JSON.parse(req.headers.user).uid === restaurant.owner) {
                try {
                    const article = await Article.findOneAndRemove({_id: new mongoose.Types.ObjectId(req.params.articleID)}).exec();
                    article !== null ? res.sendStatus(204) : res.sendStatus(404);
                } catch (error) {
                    res.status(400).json({"error": "Erreur lors de la suppression d'un article. Merci de réessayer plus tard."});
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

const getArticlesForRestaurant = async function (req, res) {
    try {
        const articles = await Article.find({restaurant: req.params.restaurantID}).exec();
        res.status(200).json({"articles": articles});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des articles. Merci de réessayer plus tard."});
    }
};

const getArticlesForRestaurantAndCategory = async function (req, res) {
    try {
        const articles = await Article.find({restaurant: req.params.restaurantID, category: req.params.category}).exec();
        res.status(200).json({"articles": articles});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des articles. Merci de réessayer plus tard."});
    }
};

const getArticlesForRestaurantAndType = async function (req, res) {
    try {
        const articles = await Article.find({restaurant: req.params.restaurantID, type: req.params.type}).exec();
        res.status(200).json({"articles": articles});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des articles. Merci de réessayer plus tard."});
    }
};

module.exports = {
    getArticle,
    createArticle,
    editArticle,
    deleteArticle,
    getArticlesForRestaurant,
    getArticlesForRestaurantAndCategory,
    getArticlesForRestaurantAndType
}