var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
require('dotenv').config();

var notificationsRoutes = require('./routes/Notifications');

var app = express();

async function launch () {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(mongoose.connection.readyState === 1 ? "Connected to cluster": "Not connected to cluster");
}

launch();

var middleware = function (req, res, next) {
    let userData = JSON.parse(req.headers.user);
    req.userIdJWT = userData.uid;
    next();
  };
  
app.use(middleware);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/notifications', notificationsRoutes);

module.exports = app;
