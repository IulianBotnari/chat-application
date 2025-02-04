const mysql = require('mysql2/promise'); // Usa mysql2 con promesse

const connectdb = mysql.createPool({
    host: process.env.HOST_DB,
    port: process.env.PORT_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = connectdb;