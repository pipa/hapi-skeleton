'use strict';

// Load Modules =================================
const minifyHTML = require('html-minifier').minify;
const Handlebars = require('handlebars');
const Config = require('~/config');

// Declare internals ============================
const internals = {
    minify: (str, options) => {
        try {
            return minifyHTML(str, Object.assign({
            collapseBooleanAttributes: false,
            collapseWhitespace: false,
            removeAttributeQuotes: false,
            removeCDATASectionsFromCDATA: false,
            removeComments: false,
            removeCommentsFromCDATA: false,
            removeEmptyAttributes: false,
            removeEmptyElements: false,
            removeOptionalTags: false,
            removeRedundantAttributes: false,
            useShortDoctype: false,
            minifyJS: false
            }, options));
        } catch (err) {
            console.warn(err);
        }
    }
};

// Exposing =====================================
module.exports = function (options) {

    options = Object.assign(options, options.hash || {});

    if (Config.get('/dev') !== 'dev') {
        options = Object.assign(options, {
            minifyJS: true,
            removeComments: true,
            collapseWhitespace: true
        })
    }
    return new Handlebars.SafeString(internals.minify(options.fn(this), options));
};