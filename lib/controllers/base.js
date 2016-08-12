'use strict';

// loading modules =============================================
const Boom = require('boom');
const JSend = require('jsend');
const Joi = require('joi');

// internals ===================================================
const internals = {};

// this class will handler all the CRUD from any api.
class Base {
    // initialize the object
    constructor(collection){
        
        // CRUD method config
        this.genericConfig = {
            read: {
                validate: { 

                },
                handler: this.read.bind(this)
            }
            
        };
    };

    read(request, reply) {
        reply('hello world');
    }
};

// exporting the class
module.exports = Base;