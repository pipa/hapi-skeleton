// Deps =========================================
const Path = require('path');
const Fs = require('fs');

// Internals ====================================
const internals = {};

// Reading all files to expose ==================
Fs.readdirSync(__dirname).forEach((file) => {

    // If its the current file ignore it
    if (file === 'index.js') {
        return;
    }

    let ctrlName = Path.basename(file, '.js');

    ctrlName = ctrlName.charAt(0).toUpperCase() + ctrlName.substr(1).toLowerCase();

    // Store module with its name (from filename)
    internals[ctrlName] = require(Path.join(__dirname, file));
});

// Exposing =====================================
module.exports = internals;
