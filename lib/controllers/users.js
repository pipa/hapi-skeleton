'use strict';

// load modules =============================================
const Boom = require('boom');
const Joi = require('joi');
const Base = require('./base');

// definition of the internals ==============================
const internals = {
    collection: 'users'
};

// class definition and extend the base class
class Users extends Base {
}

const inst = new Users(internals.model);

// exposing the internsl =================================
module.exports = internals;

