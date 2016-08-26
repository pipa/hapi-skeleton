'use strict';

// load modules =====================================
const Mongoose = require(`mongoose`);
const Schema = Mongoose.Schema;

// declaring internals ==============================
const internals = {};


// model ==========================================
internals.HomeSchema = new Schema({
    name: { type: String, trim: true},
    description: { type: String },
    date_created: { type: Date, default: Date.now }
});

internals.home = Mongoose.model(`home`, internals.HomeSchema);
// exposing internals ============================
module.exports = {
    Home: internals.home
}
