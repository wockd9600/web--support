const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    // port: '3306',
    user: 'root',
    password: 'qw12qw12!!',
    database: 'testdb',
    dateStrings: 'date',
    multipleStatements: true
});

// const poolPromise = pool.promise();

module.exports = pool;



// const pool = mysql.createPool({
//     host: '211.47.75.102',
//     // port: '3306',
//     user: 'sim0901',
//     password: 'qw12qw12!!',
//     database: 'dbsim0901',
//     dateStrings: 'date',
//     multipleStatements: true
// });


// module.exports = pool;

