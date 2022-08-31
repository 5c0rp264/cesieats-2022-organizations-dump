const app = require('express')();
const {createProxyMiddleware} = require('http-proxy-middleware');
require('dotenv').config();
const env = process.env;
const cookieParser = require('cookie-parser');
const axios = require('axios');

const authorizedURLs = [];
const baseUrl = ["/","/index","/index.html","","/index.html/","/index/"];

const middleware = async function (req, res, next) {
    if(authorizedURLs.some(element => req._parsedUrl.path.includes(element) || baseUrl.includes(req._parsedUrl.pathname))) {
        next();
    } else {
        let currentToken = req.cookies.jwt;
        if (currentToken === undefined || currentToken === null || currentToken.length === 0){
            res.redirect('/connexion.html')
        }else{
            let user = await axios.get(env.LOCALHOST_URL+env.AUTH_PORT+'/accounts/token/verification', {
                headers: { authorization: currentToken }
            })
            .then(response => {
                req.headers.user = JSON.stringify(response.data);
                next();
            })
            .catch(error => res.sendStatus(403));
        }
    }
};
  
app.use(cookieParser());
app.use('/shop', middleware);
app.use('/orders', middleware);
app.use('/notification-service', middleware);
app.use('/statistics', middleware);
app.use('/logs', middleware);
app.use('/components/download', middleware);
app.use('/components/upload', middleware);

app.use(createProxyMiddleware('/accounts',    { target: env.LOCALHOST_URL+env.AUTH_PORT }));
app.use(createProxyMiddleware('/shop',    { target: env.LOCALHOST_URL+env.SHOP_PORT, pathRewrite: { '^/shop':    '' } }));
app.use(createProxyMiddleware('/orders',  { target: env.LOCALHOST_URL+env.ORDERS_PORT, pathRewrite: { '^/orders':  '' } }));
app.use(createProxyMiddleware('/notification-service',  { target: env.LOCALHOST_URL+env.NOTIFICATIONS_PORT, pathRewrite: { '^/notification-service':    '/notifications' }}));
app.use(createProxyMiddleware('/statistics',   { target: env.LOCALHOST_URL+env.STATS_PORT }));
app.use(createProxyMiddleware('/',    { target: env.LOCALHOST_URL+env.UI_PORT, pathRewrite: { '^/':    '' } }));

 
app.listen(env.PROXY_PORT);