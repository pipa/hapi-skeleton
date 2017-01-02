// Deps =========================================
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

// declaring internals ==========================
const internals = {};

// model ========================================
internals.HomeSchema = new Schema({
    name: { type: String, trim: true},
    description: { type: String },
    date_created: { type: Date, default: Date.now }
});

// exposing internals ===========================
module.exports = {
    Home: Mongoose.model('home', internals.HomeSchema)
};
