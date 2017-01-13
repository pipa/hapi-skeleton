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

    const ctrlName = Path.basename(file, '.js');

    // Store module with its name (from filename)
    internals[ctrlName] = require(Path.join(__dirname, file));
});

// Exposing =====================================
module.exports = internals;
