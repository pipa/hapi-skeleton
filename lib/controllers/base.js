// loading modules ==============================
const Boom = require('boom');
const JSend = require('jsend');

// Class Abstract for CRUD ======================
class Base {

    constructor(collection) {

        this.model = require(`../model/${collection}`);
        this.Collection = this.model[collection];
        this.mongoCollectionName = this.Collection.collection.collectionName;
    }

    create(request, reply) {

        const { payload } = request;
        const newDoc = new this.Collection(payload);

        newDoc.save((err, doc) => {

            const message = `db.${this.mongoCollectionName}.save(${JSON.stringify(payload)});`;
            const data = { message, payload, doc };

            return this._coda(request, reply, err, doc, data, ['database', 'save']);
        });
    }

    read(request, reply) {

        const _id = request.params._id || null;
        const limit = request.params.limit || null;
        const query = (_id) ? { _id } : {};

        this._get(query, limit).exec((err, docs) => {

            const message = `db.${this.mongoCollectionName}.find(${JSON.stringify(query)});`;
            const data = {
                message, query, limit,
                docs: docs.length
            };

            return this._coda(request, reply, err, docs, data, ['database', 'find']);
        });
    }

    update(request, reply) {

        const { payload } = request;
        const conditions = { _id: payload._id };

        delete payload._id;
        this.Collection.findOneAndUpdate(conditions, payload, { new: true }, (err, _doc) => {

            const message = `db.${this.mongoCollectionName}.findOneAndUpdate(${JSON.stringify(payload)});`;
            const data = {
                message, conditions, payload,
                doc: _doc
            };

            return this._coda(request, reply, err, _doc, data, ['database', 'update']);
        });
    }

    delete(request, reply) {

        const query = { '_id': request.params._id };

        this.Collection.findOneAndRemove(query, (err, doc) => {

            let result = [];
            const message = `db.${this.mongoCollectionName}.findOneAndRemove(${JSON.stringify(query)});`;
            const data = {
                message, query, doc
            };

            // Found doc...delete it!
            if (doc) {
                doc.remove();
                result = `${ request.params._id } deleted successfully`;
            }

            return this._coda(request, reply, err, result, data, ['database', 'delete']);
        });
    }

    test(request, reply) {

        const data = {
            message: 'Testing the `err` handling'
        };
        const err = new Error('test');

        return this._coda(request, reply, err, null, data, ['database', 'test']);
    }

    _get(query = {}, limit = null, lean = true) {

        // Generic get from mongo
        const qry = this.Collection.find(query);

        if (limit) {
            qry.limit(limit);
        }

        return qry.lean(lean);
    }

    _coda(request, reply, err, result, data, _tags = []) {

        //== Handles Mongo responses and applies HTTP status codes according to the response
        let tags = _tags;
        let response = (err !== null) ? null : JSend.success(result); // HTTP 201

        data.executionTime = request.server.app.timer.elapsed();

        if (err !== null) {
            data.error = err;
            tags = ['error', ..._tags];
            response = Boom.badRequest('Invalid query', err); // HTTP 400- Bad request
        }

        if (result && result.constructor === Array && !result.length) {
            tags = ['warning', ..._tags, 'notFound'];
            response = Boom.notFound('Record not found'); // HTTP 404 - Not Found
        }

        request.log(tags, data);

        return reply(response);
    }

}

// exporting the class
module.exports = Base;
