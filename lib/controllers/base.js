// loading modules ==============================
const Boom = require('boom');
const JSend = require('jsend');
const Joi = require('joi');

// Class Abstract for CRUD ======================
class Base {

    constructor(collection) {

        this.collectionName = collection.charAt(0).toUpperCase() + collection.substr(1).toLowerCase();
        this.model = require(`../model/${collection}`);
        this.Collection = this.model[this.collectionName];

        // CRUD method config
        this.genericConfig = {
            read: {
                validate: {
                    params: {
                        _id: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/).description(`This is a ${this.collectionName} ObjectID(). This is optional, if no ObjectID() is provided, will return all data for this collection.`).example('57959c8876fcc6fe13c057bc').unit('ObjectID()'),
                        limit: Joi.number().optional()
                    }
                },
                handler: this.read.bind(this)
            },
            delete: {
                validate: {
                    params: {
                        _id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).description(`This is a ${this.collectionName} ObjectID()`).example('57959c8876fcc6fe13c057bc').unit('ObjectID()')
                    }
                },
                handler: this.delete.bind(this)
            }
        };
    }

    get(query = {}, limit = null, lean = true) {

        // Generic get from mongo
        const qry = this.Collection.find(query);

        if (limit) {
            qry.limit(limit);
        }

        return qry.lean(lean);
    }

    create(request, reply) {

        const newDoc = new this.Collection(request.payload);

        newDoc.save((err, doc) => {

            if (err) {
                return reply(Boom.forbidden(err)); // HTTP 403
            }

            return reply(JSend.success(doc)); // HTTP 201
        });
    }

    read(request, reply) {

        const _id = request.params._id || null;
        const limit = request.params.limit || null;
        const query = (_id) ? { _id } : {};

        this.get(query, limit).exec((err, docs) => {

            if (err) {
                reply(Boom.badImplementation(err));
            }

            if (!docs.length) {
                reply(Boom.notFound('Record not found'));
            } else {
                reply(JSend.success(docs));
            }
        });
    }

    update(request, reply) {

        const conditions = {
            _id: request.payload._id
        };

        delete request.payload._id;
        this.Collection.findOneAndUpdate(conditions, request.payload, (err, _doc) => {

            if (err) {
                return reply(Boom.forbidden(err));
            }

            return reply(JSend.success(_doc));
        });
    }

    delete(request, reply) {

        this.Collection.findOne({ '_id': request.params._id }, (err, doc) => {

            if(err) {
                return reply(Boom.badRequest(`Could not delete record ${ request.params._id }`));
            }

            if (!doc) {
                return reply(Boom.notFound()); // Couldn't find the object.
            }

            // Found doc...delete it!
            doc.remove();

            return reply(JSend.success(`${ request.params._id } deleted successfully`));
        });
    }

}

// exporting the class
module.exports = Base;
