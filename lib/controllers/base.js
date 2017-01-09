// loading modules ==============================
const Boom = require('boom');
const JSend = require('jsend');
const Joi = require('joi');
const Hoek = require('hoek');

// Class Abstract for CRUD ======================
class Base {

    constructor(collection) {

        this.collectionName = collection.charAt(0).toUpperCase() + collection.substr(1).toLowerCase();
        this.model = require(`../model/${collection}`);
        this.Collection = this.model[this.collectionName];
        this.mongoCollectionName = this.Collection.collection.collectionName;

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

        const { payload, info } = request;
        const newDoc = new this.Collection(payload);

        newDoc.save((err, doc) => {

            const desc = `db.${this.mongoCollectionName}.save(${JSON.stringify(payload)});`;
            const data = {
                desc, payload, doc,
                executionTime: request.server.app.timer.elapsed()
            };
            if (err) {
                data.error = err;
                this.log(request.server, ['error', 'mongo', 'save'], data);

                return reply(Boom.forbidden(err)); // HTTP 403
            }

            this.log(request.server, ['mongo', 'save'], data);

            return reply(JSend.success(doc)); // HTTP 201
        });
    }

    read(request, reply) {

        const _id = request.params._id || null;
        const limit = request.params.limit || null;
        const query = (_id) ? { _id } : {};

        request.yar.set('example', { key: 'value' });

        this.get(query, limit).exec((err, docs) => {

            const desc = `db.${this.mongoCollectionName}.find(${JSON.stringify(query)});`;
            const data = {
                desc, query, limit,
                docs: docs.length,
                executionTime: request.server.app.timer.elapsed()
            };

            if (err) {
                data.error = err;
                this.log(request.server, ['error', 'mongo', 'find'], data);

                return reply(Boom.badImplementation(err));
            }

            if (!docs.length) {
                this.log(request.server, ['mongo', 'find', 'notFound'], data);

                return reply(Boom.notFound('Record not found'));
            }

            this.log(request.server, ['mongo', 'find'], data);

            return reply(JSend.success(docs));
        });
    }

    update(request, reply) {

        const { payload } = request;
        const conditions = { _id: payload._id };

        delete payload._id;
        this.Collection.findOneAndUpdate(conditions, payload, { new: true }, (err, _doc) => {

            const desc = `db.${this.mongoCollectionName}.update(${JSON.stringify(payload)});`;
            const data = {
                desc, conditions, payload,
                doc: _doc,
                executionTime: request.server.app.timer.elapsed()
            };

            if (err) {
                data.error = err;
                this.log(request.server, ['error', 'mongo', 'update'], data);

                return reply(Boom.forbidden(err));
            }

            this.log(request.server, ['mongo', 'update'], data);

            return reply(JSend.success(_doc));
        });
    }

    delete(request, reply) {

        const query = { '_id': request.params._id };

        this.Collection.findOne(query, (err, doc) => {

            const desc = `db.${this.mongoCollectionName}.delete(${JSON.stringify(query)});`;
            const data = {
                desc, query, doc,
                executionTime: request.server.app.timer.elapsed()
            };

            if (err) {
                data.error = err;
                this.log(request.server, ['error', 'mongo', 'delete'], data);

                return reply(Boom.badRequest(`Could not delete record ${ request.params._id }`));
            }

            if (!doc) {
                this.log(request.server, ['mongo', 'delete', 'notFound'], data);

                return reply(Boom.notFound('Record not found')); // Couldn't find the object.
            }

            // Found doc...delete it!
            doc.remove();
            this.log(request.server, ['mongo', 'delete'], data);

            return reply(JSend.success(`${ request.params._id } deleted successfully`));
        });
    }

    log(server, labels, data) {

        Object.assign(data, server.app.logData, { collection: this.mongoCollectionName, });
        server.log(labels, data);
    }

}

// exporting the class
module.exports = Base;
