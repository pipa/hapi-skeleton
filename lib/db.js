'use strcit';

// load modules ====================================
const Config = require('getconfig');
const Database = require('./database/');

const internals = {};

internals.db = new Database(Config.database.mongodb.host, Config.database.mongodb.port, Config.database.mongodb.db);
internals.db.connect;

module.exports = internals;