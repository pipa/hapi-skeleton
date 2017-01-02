/* $lab:coverage:off$ */
// Deps =========================================
const Pckg = require('~/package.json');
const Handlebars = require('handlebars');
const Mailer = require('nodemailer');
const Items = require('items');
const Juice = require('juice');
const Joi = require('joi');
const NodemailerPluginInlineBase64 = require('nodemailer-plugin-inline-base64');
const Path = require('path');
const fs = require('fs');

// Internals ====================================
const internals = {
    defaults: {
        transport: {
            service: 'Gmail',
            auth: {
                user: 'test@gmail.com',
                pass: 'test'
            }
        },
        views: {
            engines: {
                hbs: {
                    module: Handlebars.create(),
                    path: `${ __dirname }/../../emails`
                }
            }
        },
        inlineImages: true,
        inlineStyles: true
    },
    schema: Joi.object({
        transport: Joi.object(),
        views: Joi.object(),
        inlineImages: Joi.boolean(),
        inlineStyles: Joi.boolean()
    })
};

// Exposing Plugin ==============================
exports.register = (plugin, options, next) => {

    const opts = Object.assign({}, internals.defaults, options);
    const transport = Mailer.createTransport(opts.transport);

    if (opts.inlineImages) {
        transport.use('compile', NodemailerPluginInlineBase64);
    }

    plugin.dependency('vision', (server, done) => {

        if (Object.keys(opts.views.engines).length) {
            server.views(opts.views);
        }

        server.expose('send', (data, callback) => {

            Items.parallel(['text', 'html'], (format, cb) => {

                const path = typeof data[format] === 'object' ? data[format].path : '';
                const extension = Path.extname(path).substr(1);

                if (opts.views.engines.hasOwnProperty(extension)) {
                    server.render(path, data.context, (err, rendered) => {

                        if (err) {
                            return cb(err);
                        }

                        if (format === 'html' && opts.inlineStyles) {
                            data[format] = Juice(rendered); // eslint-disable-line new-cap
                        } else {
                            data[format] = rendered;
                        }

                        return cb();
                    });
                } else {
                    if (typeof data[format] !== 'object') {
                        return cb();
                    }

                    fs.readFile(path, 'utf8', (err, rendered) => {
                        if (err) {
                            return cb(err);
                        }
                        data[format] = rendered;

                        return cb();
                    });
                }
            }, (err) => {

                if (err) {
                    return callback(err);
                }

                delete data.context;
                transport.sendMail(data, callback);
            });
        });

        done();
    });

    next(); // Move along
};

// Exposing Plugin Attributes ===================
exports.register.attributes = {
    name: 'mailer',
    version: Pckg.version
};
/* $lab:coverage:on$ */
