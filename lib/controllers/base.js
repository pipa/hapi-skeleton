'use strict';

// loading modules =============================================
const Boom = require('boom');
const JSend = require('jsend');
const Joi = require('joi');

// internals ===================================================
const internals = {
    model: null
};

// this class will handler all the CRUD from any api.
class Base {
    // initialize the object
    constructor(collection){

        // local properties 
        
        
        // CRUD method config
        this.genericConfig = {
            read: {
                validate: { 

                },
                handler: this.read.bind(this)
            }
            
        };
    };

    // read the db
    read(request, reply) {
        reply('hello world');
    };

    // create the db method or table
    create(request, reply) {
        
    };

};

// exporting the class
module.exports = Base;