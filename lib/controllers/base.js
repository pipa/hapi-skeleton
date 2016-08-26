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
        // global properties 

        
        this.collectionName = collection.charAt(0).toUpperCase() + collection.substr(1).toLowerCase();
        this.model = require(`../model/${collection}`);
        this.Collection = this.model[this.collectionName];
        
        // CRUD method config
        this.genericConfig = {
            read: {
                validate: {
                    params: {
                        _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                    }
                },
                handler: this.read.bind(this)
            }
            
        };
    };

    // read the db
    read(request, reply) {

        // reading from the document dbs
        const _id = request.params._id || null;
        const query = (_id) ? { _id: _id } : {};

        // read from the collection that request the information
        this.Collection.find(query, (err, docs) => {
            
            if (err) {

                reply(Boom.badImplementation(err));
            }

            if (!docs.length) {

                reply(Boom.notFound(`record is not found`));

            } else {

                reply(JSend.success(docs));
            }
        });


    };

    // create the db method or table
    create(request, reply) {
        
        const newDoc = new this.Collection(request.payload);

        newDoc.save((err, doc) => {
             
            if (!err) {

                reply(JSend.success(doc));

            } else {

                if (err.code === 11000 || err.code === 11001 ) {

                    Boom.fobidden(`Please provide another id, it alraedy exist`);
                } else {
                    Boom.fobidden(err);
                }
            }
        });
    };

};

// exporting the class
module.exports = Base;
