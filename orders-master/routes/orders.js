var express = require('express');
var router = express.Router();

const {
    getOrder,
    createOrder,
    editOrder,
    deleteOrder,
    acceptOrder,
    getOrdersForClient,
    getOrdersForRestaurant,
    getToBeTreatedOrdersForRestaurant,
    markOrderAsValidated,
    getToBeDeliveredOrdersForDeliverer,
    markOrderAsInDelivery,
    getCurrentlyDeliveringOrderForDeliverer,
    markOrderAsDelivered,
    getOrdersByRole,
    getAllOrders
} = require ('../controllers/orders');


router.put('/delivered/:orderID', markOrderAsDelivered);
router.get('/current-delivery/', getCurrentlyDeliveringOrderForDeliverer);
router.get('/deliverers/', getToBeDeliveredOrdersForDeliverer);
router.get('/', getAllOrders);
router.get('/history', getOrdersByRole);
router.get('/:orderID', getOrder);
router.post('/', createOrder);
router.put('/:orderID', editOrder);
router.delete('/:orderID', deleteOrder);
router.put('/:orderID/restaurants/:restaurantID/validate', markOrderAsValidated);
router.put('/:orderID/restaurants/:restaurantID/inDelivery', markOrderAsInDelivery);
router.get('/restaurants/current/:restaurantID', getToBeTreatedOrdersForRestaurant);
router.get('/restaurants/:restaurantID', getOrdersForRestaurant);
router.get('/clients/:clientID', getOrdersForClient);
router.put('/:orderID/deliverers/accept', acceptOrder);

module.exports = router;