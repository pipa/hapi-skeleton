'use strcit';

// load modules ====================================
const Mongoose = require('mongoose');
const Config = require('getconfig');

// instanls declarations
const internals = {
    
    closeConnection: () => {
        
        internals.db.close(() => {
            
            process.exit(0);
        });
    }
};

// mongo connections ==============================
Mongoose.connect(`mongodb://${Config.database.mongodb.host}:${Config.database.mongodb.port}/${Config.database.mongodb.db}`);
internals.db = Mongoose.connection;
internals.db.on('error', () => {

    console.log('error', 'Error connecting the db');
    internals.closeConnection();
});

// if everhing was fine
internals.db.on('open', () => {
    console.log('info', 'Connection with database succeeded');
});

process.on('SIGINT', () => {
    console.log('info', 'Mongoose disconnect on db termination');
    internals.closeConnection();
    
});

// exposing internals ==============================
module.exports = {
    Mongoose: Mongoose,
    db: internals.db
}