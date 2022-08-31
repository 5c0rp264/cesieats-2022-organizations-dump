var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();

var articlesRouter = require('./routes/articles');
var restaurantsRouter = require('./routes/restaurants');
var menuRouter = require('./routes/menus');

var app = express();

async function launch () {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(mongoose.connection.readyState === 1 ? "Connected to cluster": "Not connected to cluster");
}

launch();

app.use(logger('dev'));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ limit: '5mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/articles', articlesRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/menus', menuRouter);

module.exports = app;
