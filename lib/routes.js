'use strict';

// Load Modules =================================
const Handlebars = require('handlebars');
const Controllers = require('./controllers');
const Config = require('getconfig');
const SEO = require('./seo');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    //== Setting vars
    const viewsPath = `${__dirname}/../web`;
    const seo = new SEO();
    let routes = [];
    let key;

    //== Looping Controllers object to dynamically add routes
    for(key in Controllers) {
        if ('routes' in Controllers[key]) {
            Array.prototype.push.apply(routes, Controllers[key].routes);
        }
    }

    //== Routes
    plugin.route(routes);

    // == Views Engine
    plugin.views({
        engines: {
            hbs: Handlebars
        },
        path: `${viewsPath}/views`,
        partialsPath: `${viewsPath}/partials`,
        helpersPath: `${viewsPath}/helpers`,
        layoutPath: `${viewsPath}/layouts`,
        layout: 'default',
        context: (req) => {

            const { metas, section, item } = seo.get(req.response.source.template);
            return {
                appName: Config.name,
                assetsPath: Config.urls.assets,
                language: 'en',
                env: `${Config.getconfig.env}`,
                today: new Date(),
                metas,
                section,
                item
            };
        }
    });

    //== Catching errors
    plugin.ext('onPreResponse', (request, reply) => {

        if (request.response.isBoom) {
            const err = request.response;
            const errName = err.output.payload.error;
            const statusCode = err.output.payload.statusCode;

            console.log(err, errName, statusCode);
            return reply.view('main/error', { statusCode, errName }).code(statusCode);
        }

        reply.continue();
    });

    //== Move Along
    next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'routes',
    version: require('../package.json').version
};
