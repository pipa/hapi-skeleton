'use strcit';

// load modules ====================================
const Mongoose = require('mongoose');
const Config = require('getconfig');

// instanls declarations
const internals = {
    
    closeConnection: () => {
        
        internals.db.close(() => {
            
            proccess.exit(0);
        });
    }
};


// mongo connections ==============================
Mongoose.connect(`mongodb://${Config.database.host}/${Config.database.db}:${Config.database.port}`);
internals.db = Mongoose.connection;
internals.db.on('error', () => {

    server.log('error', 'Error connecting the db');
     internals.closeConnection();
});

// if everhing was fine
internals.db.on('open', () => {
    server.log('info', 'Connection with database succeeded');
});

proccess.on('SIGNT', () => {
    server.log('info', 'Mongoose disconnect on db termination');
});

// exposing internals ==============================
module.exports = {
    Mongoose: Mongoose,
    db: internals.db
}