//let mysql = require('mysql');
const mysql = require('promise-mysql')
module.exports = {
    connect: async function(){
        return await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
          });
    }
}