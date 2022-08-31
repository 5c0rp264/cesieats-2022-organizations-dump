var express = require('express');
var router = express.Router();

const {
    getArticle,
    createArticle,
    editArticle,
    deleteArticle,
    getArticlesForRestaurant,
    getArticlesForRestaurantAndCategory,
    getArticlesForRestaurantAndType
} = require('../controllers/articles');

router.get('/:articleID', getArticle);
router.post('/', createArticle);
router.put('/:articleID', editArticle);
router.delete('/:articleID', deleteArticle);
router.get('/restaurants/:restaurantID', getArticlesForRestaurant);
router.get('/restaurants/:restaurantID/categories/:category', getArticlesForRestaurantAndCategory);
router.get('/restaurants/:restaurantID/types/:type', getArticlesForRestaurantAndType);


module.exports = router;