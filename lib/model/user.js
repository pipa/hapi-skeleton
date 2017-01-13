// Deps =========================================
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

// declaring internals ==========================
const internals = {};

// model ========================================
internals.UserSchema = new Schema({
    firstname: { type: String, trim: true },
    lastname: { type: String, trim: true },
    email: { type: String, unique: true, index: true, lowercase: true, trim: true },
    date_created: { type: Date, default: Date.now }
});

// exposing internals ===========================
module.exports = {
    user: Mongoose.model('user', internals.UserSchema)
};
