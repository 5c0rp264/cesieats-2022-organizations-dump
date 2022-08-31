const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const env = process.env;


async function sendNotification(orderID, message){
    try {
        const order = await Order.findOne({_id: new mongoose.Types.ObjectId(orderID)}).exec();
        console.log("order");
        console.log(order);
        let config = {
            headers: {
                user: JSON.stringify({
                    uid : order.client._id
                }),
            }
        }
        let formData = {
            user_id : order.client._id,
            content : message
        };
        console.log("formData");
        console.log(formData);
        await axios.post(env.LOCALHOST_URL+env.NOTIFICATIONS_PORT+'/notifications/create', (formData), config).catch((err) => {
            console.log(err);
        });
    }catch (error){
        console.log(error);
    }

}

const getOrder = async function (req, res) {
    try {
        const order = await Order.findOne({_id: new mongoose.Types.ObjectId(req.params.orderID)}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};

const getAllOrders = async function (req, res) {
    try {
        const orders = await Order.find().exec();
        res.status(200).json({"orders": orders});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération des commandes. Merci de réessayer plus tard."});
    }
}

const createOrder = async function (req, res) {

    if(JSON.parse(req.headers.user).role === 'user') {
        const order = new Order({
            client: JSON.parse(req.body.client),
            restaurant: JSON.parse(req.body.restaurant),
            deliverer: req.body.deliverer,
            timestamp: Date.now(),
            isPaid: false,
            price: req.body.price,
            menus: JSON.parse(req.body.menus),
            articles: JSON.parse(req.body.articles),
            status: [{
                name: 'created',
                timestamp: Date.now(),
            }]
        });

        try {
            const savedOrder = await order.save();
            res.status(201).json({"order": savedOrder});
        } catch (error) {
            console.log(error);
            res.status(400).json({"error": "Erreur lors de la sauvegarde d'une commande. Merci de réessayer plus tard."});
        }
    } else {
        res.sendStatus(403);
    }
};

const editOrder = async function (req, res) {
    try {
        const order = await Order.updateOne({_id: new mongoose.Types.ObjectId(req.params.orderID)}, {
            deliverer: req.body.deliverer,
            isPaid: req.body.isPaid,
            price: req.body.price,
            menus: req.body.menus,
            articles: req.body.articles,
            status: req.body.status,
        });
        order !== null ? res.sendStatus(203) : res.sendStatus(404);
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la mise à jour d'une commande. Merci de réessayer plus tard."});
    }
};

const deleteOrder = async function (req, res) {
    try {
        const order = await Order.findOneAndRemove({_id: new mongoose.Types.ObjectId(req.params.orderID)}).exec();
        order !== null ? res.sendStatus(204) : res.sendStatus(404);
    } catch (error) {
        res.status(400).json({"error": "Erreur lors de la suppression d'une commande. Merci de réessayer plus tard."});
    }
};


// /!\/!\/!\/!\/!\/!\/!\/!\ FROM THERE EVERYTHING IS UNTESTED /!\/!\/!\/!\/!\/!\/!\/!\-------------------

const getOrdersForRestaurant = async function (req, res) {
    try {
        const order = await Order.find({"restaurant._id": req.params.restaurantID}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};

const getToBeTreatedOrdersForRestaurant  = async function (req, res) {
    try {
        console.log(req.params.restoID);
        const order = await Order.find({'restaurant._id': req.params.restaurantID, 'status': { $not: { $size: 5 } }}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};


const getToBeDeliveredOrdersForDeliverer  = async function (req, res) {
    try {
        const order = await Order.find({'status': { $size: 2 }}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        console.log(error);
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};


const getCurrentlyDeliveringOrderForDeliverer  = async function (req, res) {
    try {
        const order = await Order.findOne({'deliverer._id': String(JSON.parse(req.headers.user).uid),$or: [{'status': { $size: 3 }}, {'status': { $size: 4 }}]}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        console.log(error);
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};

const getOrdersForClient = async function (req, res) {
    try {
        const order = await Order.find({"client.id": JSON.parse(req.headers.user).uid}).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};



const markOrderAsDelivered = async function (req, res) {
    try {
        sendNotification(req.params.orderID, "Votre commande a été livrée.");
        const order = await Order.updateOne(
            { _id: req.params.orderID }, 
            { $push: { 
                status: {
                    name: 'delivered',
                    timestamp: Date.now(),
                } 
                } 
            },
        ).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};



const markOrderAsValidated = async function (req, res) {
    try {
        sendNotification(req.params.orderID, "Votre commande est en attente d'un livreur.");
        const order = await Order.updateOne(
            { _id: req.params.orderID }, 
            { $push: { 
                status: {
                    name: 'validated',
                    timestamp: Date.now(),
                } 
                } 
            },
        ).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};

const markOrderAsInDelivery = async function (req, res) {
    try {
        sendNotification(req.params.orderID, "Votre commande est prise en charge par un livreur, il est sur son chemin vers chez vous.");
        const order = await Order.updateOne(
            { _id: req.params.orderID }, 
            { $push: { 
                status: {
                    name: 'indelivery',
                    timestamp: Date.now(),
                } 
                } 
            },
        ).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};

const acceptOrder = async function (req, res) {
    try {
        sendNotification(req.params.orderID, "Votre commande est assignée a un livreur, il est sur son chemin pour la récupérer au restaurant.");
        console.log(req.body);
        let order = await Order.updateOne(
            { _id: req.params.orderID }, 
            {$set: { 
                deliverer: {
                    _id: req.body.id,
                    name: req.body.name,
                }
            }},
        ).exec();
        order = await Order.updateOne(
            { _id: req.params.orderID },
            { $push: { 
                status: {
                    name: 'assigned',
                    timestamp: Date.now(),
                } 
                } 
            },
        ).exec();
        res.status(200).json({"order": order});
    } catch (error) {
        res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
    }
};


const getOrdersByRole = async function (req, res) {

    let user = JSON.parse(req.headers.user);
    if(user.role === 'restaurant') {
        try {
            const restaurant = await Restaurant.findOne({owner: user.uid}).exec();
            const orders = await Order.find({'restaurant._id': String(restaurant._id)}).sort({timestamp: -1}).exec();
            res.status(200).json({"orders": orders});
        } catch (error) {
            res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
        }
    } else if (user.role === 'user') {
        try {
            console.log(user.uid);
            const orders = await Order.find({'client._id': String(JSON.parse(req.headers.user).uid)}).sort({timestamp: -1}).exec();
            res.status(200).json({"orders": orders});
        } catch (error) {
            res.status(404).json({"error": "Erreur lors de la récupération d'une commande. Merci de réessayer plus tard."});
        }
    } else {
        res.sendStatus(403);
    }

}

module.exports = {
    getOrder,
    createOrder,
    editOrder,
    deleteOrder,
    getOrdersForRestaurant,
    getToBeTreatedOrdersForRestaurant,
    getOrdersForClient,
    acceptOrder,
    markOrderAsValidated,
    markOrderAsInDelivery,
    getToBeDeliveredOrdersForDeliverer,
    getOrdersByRole,
    getAllOrders,
    markOrderAsDelivered,
    getCurrentlyDeliveringOrderForDeliverer
}