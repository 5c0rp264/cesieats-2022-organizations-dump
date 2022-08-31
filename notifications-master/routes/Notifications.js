var express = require('express');
//const { models } = require('mongoose');
var router = express.Router();
const model = require('../models/Notification');
const mongoose = require('mongoose');

/* GET specific notification */
router.get('/id/:notificationID', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir une notification avec son identifiant et de mettre à jour son état"
    // #swagger.tags = ['Notifications']
    const notification = await model.findOneAndUpdate({_id: req.params.notificationID, user_id: req.userIdJWT}, {wasRead: true }).exec();
    res.json(notification);
});

/* GET all notifications mark as read then*/
router.get('/', async function(req, res, next) {
    // #swagger.description = "Récupère toutes les notifications"
    // #swagger.tags = ['Notifications']
    const notifications = await model.find({user_id: req.userIdJWT}).sort({ timestamp: -1 }).exec();
    res.json(notifications);
    model.updateMany({user_id: req.userIdJWT, wasRead: false}, {wasRead: true}).exec();
});

/* GET all notifications mark as read then*/
router.get('latest/:NLatest', async function(req, res, next) {
        // #swagger.description = "Récupère les X dernières notifications"
    // #swagger.tags = ['Notifications']
    const notifications = await model.find({user_id: req.userIdJWT}).sort({ timestamp: -1 }).limit(req.params.NLatest).exec();
    res.json(notifications);
    model.updateMany({user_id: req.userIdJWT, wasRead: false}, {wasRead: true}).exec();
});


/* GET all unread notifications mark as read then*/
router.get('/unread/:markAsRead?', async function(req, res, next) {
        // #swagger.description = "Récupère l'ensemble des notifications non lues"
    // #swagger.tags = ['Notifications']
    const notifications = await model.find({user_id: req.userIdJWT, wasRead: false}).sort({ timestamp: -1 }).exec();
    res.json(notifications);
    if (req.params.markAsRead && req.params.markAsRead=="1"){
        model.updateMany({user_id: req.userIdJWT, wasRead: false}, {wasRead: true}).exec();
    }
});


/* POST mark all notifications as  read*/
router.post('/markAsRead', async function(req, res, next) {
        // #swagger.description = "Change l'état de toutes les notifications d'un utilisateur"
    // #swagger.tags = ['Notifications']
    model.updateMany({user_id: req.userIdJWT, wasRead: false}, {wasRead: true}).exec(function (err, book) {
        if (err) {
            res.status(500).send('Failure.');
            console.error(err);
        }else{
            res.status(200).send('Success.');
        }
      });
});


/* Create new notification */
router.post('/create', async function(req, res, next) {
        // #swagger.description = "Permet de créer une nouvelle notification"
    // #swagger.tags = ['Notifications']
    console.log(req.body);
    if (req.body.content && req.body.user_id) {
        let notification = new mongoose.models.notification({ _id: mongoose.Types.ObjectId(),content: req.body.content, user_id: req.body.user_id });
        notification.save(function (err, book) {
            if (err) {
                res.status(500).send('Failure.');
                console.error(err);
            }else{
                res.status(200).send('Success.');
            }
          });
        
    }else{
        res.status(400).send('Please specify each elements.');
    }
});


module.exports = router;