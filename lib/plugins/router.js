// Deps =========================================
const handlebars = require('handlebars');
const config = require('~/config');
const routes = require('~/lib/routes');
const pkg = require('~/package.json');

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    plugin.dependency('seo', (server, done) => {

        const seo = server.plugins.seo;
        const viewsPath = `${ config.get('/root') }/web`;
        const routesTable = [];
        let key;

        // Looping Routes object to dynamically add routes
        for (key in routes) {
            Array.prototype.push.apply(routesTable, routes[key]);
        }

        // Routes Table
        plugin.route(routesTable);

        // Views Engine
        plugin.views({
            engines: { hbs: handlebars },
            path: `${viewsPath}/views`,
            partialsPath: `${viewsPath}/partials`,
            helpersPath: `${viewsPath}/helpers`,
            layoutPath: `${viewsPath}/layouts`,
            layout: 'default',
            context: (req) => {

                const { metas, section, item } = seo.get(req.response.source.template);
                return {
                    metas, section, item,
                    appName: pkg.name,
                    assetsPath: config.get('/urls/assets'),
                    language: 'en',
                    env: `${ config.get('/env') }`,
                    today: new Date()
                };
            }
        });

        // Catching errors
        plugin.ext('onPreResponse', (request, reply) => {

            if (request.response.isBoom) {
                const err = request.response;
                const errName = err.output.payload.error;
                const statusCode = err.output.payload.statusCode;

                console.log(err);
                return reply.view('main/error', { statusCode, errName }).code(statusCode);
            }

            return reply.continue();
        });

        return done();
    });

    // Move Along
    return next();
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'router',
    version: pkg.version
};
