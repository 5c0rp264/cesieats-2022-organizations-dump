var express = require('express');
//const { models } = require('mongoose');
var router = express.Router();
const modelOrder = require('../models/Order');
const modelArticle = require('../models/Article');
const mongoose = require('mongoose');
const osutils = require('os-utils');



//article quantity for a specified restaurant for a specific type
router.get('/quantity/:restoId/:type', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir la quantité d'article d'un restaurant pour un type spécifique"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelArticle.aggregate(
        [
            {
                $match:
                {
                    restaurant: req.params.restoId,
                    type: req.params.type
                    
                },
            },
            {
                $group:
                {
                    _id: 
                    {
                        "id": "$restaurant",
                        "type": "$type"
                    },
                    amount: { $count: {} },
                }
            }
            ]
    );
    res.json(stat);
});


//article quantity for a specified restaurant for each types
router.get('/quantity/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir la quantité d'article d'un restaurant pour chaque type"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelArticle.aggregate(
        [
            {
                $match:
                {
                    restaurant: req.params.restoId,                    
                },
            },
            {
                $group:
                {
                    _id: 
                    {
                        "id": "$restaurant",
                        "type": "$type"
                    },
                    amount: { $count: {} },
                }
            }
            ]
    );
    res.json(stat);
});


//article quantity for a specified restaurant
router.get('/overallquantity/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir la quantité générale d'article d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelArticle.aggregate(
        [
            {
                $match:
                {
                    restaurant: req.params.restoId,                    
                },
            },
            {
                $group:
                {
                    _id: 
                    {
                        "id": "$restaurant"
                    },
                    amount: { $count: {} },
                }
            }
            ]
    );
    res.json(stat);
});


//average price for a specified restaurant for a specific type
router.get('/price/average/:restoId/:type', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le prix moyen d'un type au sein d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelArticle.aggregate(
        [
            {
                $match:
                {
                    restaurant: req.params.restoId,
                    type: req.params.type
                    
                },
            },
            {
                $group:
                {
                    _id: 
                    {
                        "id": "$restaurant",
                        "type": "$type"
                    },
                    avgPrice: { $avg: "$price" },
                }
            }
            ]
    );
    res.json(stat);
});


/* GET average price for a specific restaurant */
router.get('/price/average/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le prix moyen d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelArticle.aggregate(
        [
            {
                $group:
                {
                    _id: "$restaurant",
                    avgPrice: { $avg: "$price" },
                }
            },
            {
                $match:
                {
                    _id: req.params.restoId,
                }
            }
            ]
    );
    res.json(stat);
});


/* GET average sales $$  for a specific restaurant per month*/
router.get('/sales/average/month/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le chiffre d'affaires moyen mensuel d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    avgPrice: { $avg: "$price" },
                }
            }

            ]
    );
    res.json(stat);
});


/* GET average sales $$  for a specific restaurant per day*/
router.get('/sales/average/day/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le chiffre d'affaires moyen quotidien d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        day: {$dayOfMonth: "$timestamp"},
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    avgPrice: { $avg: "$price" },
                }
            }

            ]
    );
    res.json(stat);
});



/* GET average sales quantity for a specific restaurant per month*/
router.get('/sales/quantity/month/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le nombre de vente moyenne mensuel d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    amount: { $count: {} },
                }
            }

            ]
    );
    res.json(stat);
});


/* GET average sales quantity for a specific restaurant per day*/
router.get('/sales/quantity/day/:restoId', async function(req, res, next) {
     // #swagger.description = "Permet d'obtenir le nombre de vente moyenne quotidienne d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        day: {$dayOfMonth: "$timestamp"},
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    amount: { $count: {} },
                }
            }

            ]
    );
    res.json(stat);
});


/* GET sum of sales $$  for a specific restaurant per day*/
router.get('/sales/sum/day/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le total des ventes quotidiennes d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        day: {$dayOfMonth: "$timestamp"},
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    sale: { $sum: "$price" },
                }
            }

            ]
    );
    res.json(stat);
});

/* GET sum of sales $$  for a specific restaurant per month*/
router.get('/sales/sum/month/:restoId', async function(req, res, next) {
        // #swagger.description = "Permet d'obtenir le total des ventes mensuelles d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        month: {$month: "$timestamp"},
                        year: {$year: "$timestamp"}
                    },
                    sale: { $sum: "$price" },
                }
            }

            ]
    );
    res.json(stat);
});







/* GET sum of sales $$  for a specific restaurant per year*/
router.get('/sales/sum/year/:restoId', async function(req, res, next) {
    // #swagger.description = "Permet d'obtenir le total des ventes annuelles d'un restaurant"
    // #swagger.tags = ['Restaurant statistics']
    const stat = await modelOrder.aggregate(
        [
            {
                $match:
                {
                    "restaurant._id": req.params.restoId,
                }
            },
            {
                $group:
                {
                    _id: {
                        year: {$year: "$timestamp"}
                    },
                    sale: { $sum: "$price" },
                }
            }

            ]
    );
    res.json(stat);
});


router.get('/system/informations', async function(req, res) {
    // #swagger.description = "Permet d'obtenir de nombreuses statistiques à propos des serveurs et du processus"
    // #swagger.tags = ['Server statistics']
    let wholeData = [];

    wholeData.push(["Plateforme",osutils.platform(),'fa-solid fa-computer text-gray-300 '])
    wholeData.push(["Nombre de CPUs",osutils.cpuCount(),'fa-solid fa-microchip text-gray-300 '])
    osutils.cpuUsage(function(v) {
        wholeData.push(["Utilisation des CPUs",v,'fa-solid fa-fire-burner text-gray-300 '])
    });
    wholeData.push(["Charge moyenne (5m)",osutils.loadavg(5),'fa-solid fa-scale-balanced text-gray-300 '])

    wholeData.push(["Mémoire totale (MB)",osutils.totalmem(),'fa-solid fa-circle text-gray-300 '])
    wholeData.push(["Mémoire Libre (MB)",osutils.freemem(),'fa-regular fa-circle text-gray-300 '])
    wholeData.push(["Mémoire Libre (%)",osutils.freememPercentage().toFixed(2),'fa-solid fa-percent text-gray-300 '])
    wholeData.push(["Durée d'activité ",osutils.sysUptime(),'fa-solid fa-circle text-success'])

    res.status(200).json(wholeData)
});

module.exports = router;