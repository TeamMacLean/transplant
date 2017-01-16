const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const Request = thinky.createModel('Request', {
    id: type.string(),
    createdAt: type.date().default(r.now()),
    approved: type.boolean().default(false),

});

//TODO will backbones, strains, selections, and tdna be shared?

module.exports = Request;