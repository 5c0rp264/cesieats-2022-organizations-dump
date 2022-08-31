var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
mongoose.set('debug', true);

require('dotenv').config();

var ordersRouter = require('./routes/orders'); 

var app = express();

async function launch () {
    mongoose.set('debug', true);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(mongoose.connection.readyState === 1 ? "Connected to cluster": "Not connected to cluster");
}

launch();

app.use(logger('dev'));
app.use(express.json({limit: '5000mb'}));
app.use(express.urlencoded({ limit: '5000mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/orders', ordersRouter);

module.exports = app;
