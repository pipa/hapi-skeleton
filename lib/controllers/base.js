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

            const message = `Create in collection "${this.mongoCollectionName}"`;
            const entry = { message, data: { payload, doc } };

            return this._coda(request, reply, err, doc, entry, ['database', 'save']);
        });
    }

    read(request, reply) {

        const _id = request.params._id || null;
        const limit = request.params.limit || null;
        const sort = (!_id) ? { date_created: 1 } : null;
        const query = (_id) ? { _id } : {};
        const message = `Read from collection: "${this.mongoCollectionName}"`;
        const entry = { message, data: { query } };

        return this._get(query, false, limit, sort)
<<<<<<< HEAD
            .then(docs => this._coda(request, reply, null, docs, {}, ['database', 'find']))
=======
            .then(docs => this._coda(request, reply, null, docs, entry, ['database', 'find']))
>>>>>>> 57d8a62ca69e364a5e2d794fbe08c6ae3d8c0084
            // $lab:coverage:off$
            .catch(err => reply(Boom.badGateway(err)));
            // $lab:coverage:on$
    }

    update(request, reply) {

        const { payload } = request;
        const query = { _id: payload._id };
<<<<<<< HEAD
=======
        const message = `Update to collection: "${this.mongoCollectionName}"`;
        const data = { message, data: { query, payload } };
>>>>>>> 57d8a62ca69e364a5e2d794fbe08c6ae3d8c0084

        delete payload._id;

        return this._get(query, true)
            .then(_doc => {

                const doc = Object.assign(_doc, payload);

                doc.save((err, doc) => {

                    const message = `${this.mongoCollectionName} Update(${JSON.stringify(Object.assign({}, query, payload))});`;
<<<<<<< HEAD
                    const data = { message, query, payload, doc };

                    return this._coda(request, reply, null, doc, {}, ['database', 'update']);
=======

                    return this._coda(request, reply, null, doc, data, ['database', 'update']);
>>>>>>> 57d8a62ca69e364a5e2d794fbe08c6ae3d8c0084
                });
            })
            // $lab:coverage:off$
            .catch(err => reply(Boom.badGateway(err)));
            // $lab:coverage:on$
    }

    delete(request, reply) {

        const query = { '_id': request.params._id };

        this.Collection.findOneAndRemove(query, (err, doc) => {

            let result = [];
            const message = `Delete from collection: "${this.mongoCollectionName}"`;
            const entry = {
                message, data: { query }
            };

            // Found doc...delete it!
            if (doc) {
                doc.remove();
                result = `${ request.params._id } deleted successfully`;
            }

            return this._coda(request, reply, err, result, entry, ['database', 'delete']);
        });
    }

    test(request, reply) {

        const entry = {
            message: 'Testing the `err` handling'
        };
        const err = new Error('test');

        return this._coda(request, reply, err, null, entry, ['database', 'test']);
    }

    _get(query = {}, findOne = false, limit = null, sort = null, lean = true) {

        //== Query handler for `find()`
        //-- plus, adds lean, sort and limit to a query

        // Generic get from mongo
        let qry = this.Collection;

        if (findOne) {
            return qry.findOne(query);
        }

        // Normal find()
        qry = qry.find(query);

        // If we have a limit
        if (limit) {
            qry.limit(limit);
        }

        // Apply sort if passed in
        if (sort) {
            qry.sort(sort);
        }

        // Return a lean query
        return qry.lean(lean);
    }

    _coda(request, reply, err, result, entry, _tags = []) {

        //== Handles Mongo responses and applies HTTP status codes according to the response
        let tags = _tags;
        let response = (err !== null) ? null : JSend.success(result); // HTTP 201

        if (err !== null) {
            entry.error = err;
            tags = ['error', ..._tags];
            response = Boom.badRequest('Invalid query', err); // HTTP 400- Bad request
        }

        if (result && result.constructor === Array && !result.length) {
            tags = ['warning', ..._tags, 'notFound'];
            response = Boom.notFound('Record not found'); // HTTP 404 - Not Found
        }

        request.log(tags, entry);

        return reply(response);
    }

}

// exporting the class
module.exports = Base;
