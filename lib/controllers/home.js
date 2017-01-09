// Load Modules =================================
const Joi = require('joi');
const BaseCTRL = require('./base');

// Internals ====================================
const internals = {
    collection: 'home'
};

// Class Instantiation ==========================
class ContactCTRL extends BaseCTRL { }
const inst = new ContactCTRL(internals.collection);

// Create =======================================
internals.create = {
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: inst.create.bind(inst)
};

// Read =========================================
internals.read = inst.genericConfig.read;

// Update =======================================
internals.update = {
    validate: {
        payload: {
            _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).description('This is a Home ObjectID()').example('57959c8876fcc6fe13c057bc').unit('ObjectID()'),
            name: Joi.string(),
            description: Joi.string()
        }
    },
    handler: inst.update.bind(inst)
};

// Delete =======================================
internals.delete = inst.genericConfig.delete;

// Routes Conf ==================================
internals.routes = [
    { method: 'POST', path: '/home', config: internals.create },
    { method: 'GET', path: '/homes', config: internals.read },
    { method: 'GET', path: '/homes/{limit}', config: internals.read },
    { method: 'GET', path: '/home/{_id}', config: internals.read },
    { method: 'PUT', path: '/home', config: internals.update },
    { method: 'DELETE', path: '/home/{_id}', config: internals.delete },

    { method: 'GET', path: '/', handler: (request, reply) => {

        console.log(request.yar.id);
        request.yar.set('example', { foor: 'bar' });
        return reply(request.yar.get('example'));
    } }
];

// Exposing =====================================
module.exports = internals;
