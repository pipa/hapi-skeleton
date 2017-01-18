// Deps =========================================
const Joi = require('joi');
const userCtrl = require('../controllers/user');

// Internals ====================================
const internals = {
    collection: 'user',
    _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/)
        .description(`This is a '${this.collection}' ObjectID()`)
        .example('57959c8876fcc6fe13c057bc').unit('ObjectID()'),
    payload: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required()
    },
    genericConfig: {
        read: {
            auth: false,
            validate: {
                params: {
                    _id: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/).description(`This is a ${this.collectionName} ObjectID(). This is optional, if no ObjectID() is provided, will return all data for this collection.`).example('57959c8876fcc6fe13c057bc').unit('ObjectID()'),
                    limit: Joi.number().optional()
                }
            }
        },
        delete: {
            validate: {
                params: {
                    _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).description(`This is a ${this.collectionName} ObjectID()`).example('57959c8876fcc6fe13c057bc').unit('ObjectID()')
                }
            }
        }
    }
};

// internals.updatePayload = Object.assign({}, { _id: internals._id }, internals.payload);

// Routes Conf ==================================
internals.routes = [
    {
        method: 'GET',
        path: '/madero',
        config: { auth: false },
        handler: (request, reply) => {

            request.log(['test', 'error'], 'Test event');

            return reply('ok');
        }
    },
    {
        method: 'POST',
        path: '/user',
        handler: userCtrl.create,
        config: {
            validate: {
                payload: internals.payload
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
        handler: userCtrl.read,
        config: internals.genericConfig.read
    },
    {
        method: 'GET',
        path: '/users/{limit}',
        handler: userCtrl.read,
        config: internals.genericConfig.read
    },
    {
        method: 'GET',
        path: '/user/{_id}',
        handler: userCtrl.read,
        config: internals.genericConfig.read
    },
    {
        method: 'PUT',
        path: '/user',
        handler: userCtrl.update,
        config: {
            validate: {
                payload: internals.updatePayload
            }
        }
    },
    {
        method: 'DELETE',
        path: '/user/{_id}',
        handler: userCtrl.delete,
        config: internals.genericConfig.delete
    }
];

// Exposing =====================================
module.exports = internals.routes;
