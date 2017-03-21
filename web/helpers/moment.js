'use strict';

// Load Modules =================================
const moment = require('moment');

// Exposing =====================================
module.exports = function (context, block) {

    var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f); //had to remove Date(context)
};
