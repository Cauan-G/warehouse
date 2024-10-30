const mysql = require('mysql2/promise');

const conecao = mysql.createPool({
    host: 'localhost',        
    user: 'root',             
    password: '',             
    database: 'warehouse',    
    waitForConnections: true,
    connectionLimit: 10,      
    queueLimit: 0            
});

module.exports = conecao;
