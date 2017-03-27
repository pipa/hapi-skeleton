// Deps =========================================
const pkg = require('~/package.json');
const seo = require('~/config/seo');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    // Gets SEO data by given view path
    const get = (path) => {

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
    };

    plugin.expose('get', get);

    // Move Along
    return next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'seo',
    version: pkg.version
};
