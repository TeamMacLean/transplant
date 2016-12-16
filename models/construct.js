const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const Construct = thinky.createModel('Construct', {
    id: type.string(),
    createdAt: type.date().default(r.now()),
    approved: type.boolean(),

});

//TODO will backbones, strains, selections, and tdna be shared?

module.exports = Construct;