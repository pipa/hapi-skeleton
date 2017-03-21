'use strict';

// Load Modules =================================
const seo = require('../config/seo');

// Internals Namespace ==========================
const internals = {
    instance: null
};

// SEO class ====================================
class SEO {
    constructor() {
        let { instance } = internals;
        if (!instance) {
            instance = this;
        }

        return instance;
    }

    get(path) {

        let result = {
            metas: seo.default,
            section: null,
            item: null
        };
        let splitPath = path.split('/');
        let section;
        let item;

        if (splitPath.length === 2) {
            section = splitPath[0];
            item = splitPath[1];

            if (section in seo && item in seo[section]) {
                result = Object.assign(result, { section, item }, { metas: seo[section][item] });
            }
        }

        return result;
    }
}

// Exposing =====================================
module.exports = SEO;
