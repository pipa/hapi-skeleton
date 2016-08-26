'use strict';

// load modules ==================================
const Boom = require('boom');
const Joi = require('joi');
const Base = require('./base');

// defining internals ============================
const internals = {
    collection: 'home'
};

// instance the base classes
class Home extends Base {
    // here you can override any method or create a new one
};

// createing the new object class
const inst = new Home(internals.collection);

// use home pages
internals.read = inst.genericConfig.read;

// post data for home description servers
internals.create = {
    validate: {
        payload: {
            name: Joi.string(),
            description: Joi.string(), 
        }
    },
    handler: inst.create.bind(inst)
};

// exposing the internals ======================
module.exports = internals;