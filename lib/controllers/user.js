// Deps =========================================
const BaseCTRL = require('./base');

// Class Instantiation ==========================
class ContactCTRL extends BaseCTRL { }
const inst = new ContactCTRL('user');

// Internals ====================================
const internals = {
    create: inst.create.bind(inst),
    read: inst.read.bind(inst),
    update: inst.update.bind(inst),
    delete: inst.delete.bind(inst)
};

// Exposing =====================================
module.exports = internals;
