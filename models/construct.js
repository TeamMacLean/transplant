const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const Construct = thinky.createModel('Construct', {
    id: type.string(),
    requestID: type.string().required(),
    createdAt: type.date().default(r.now()),
    name: type.string().required(),
    backbone: type.string().required(),
    tdna: type.string().required()
});

module.exports = Construct;

const Request = require('./request');
Construct.belongsTo(Request, "request", "requestID", "id");
const Strain = require('./strain');
Construct.hasMany(Strain, "strains", "id", "constructID");