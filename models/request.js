const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const Request = thinky.createModel('Request', {
    id: type.string(),
    createdAt: type.date().default(r.now()),
    date: type.string().required(),
    approved: type.boolean().default(false),
    username: type.string().required(),
    species: type.string().required(),
    genotypes: type.array().schema(type.string()).required()
});

module.exports = Request;

const Construct = require('./construct');
Request.hasMany(Construct, "constructs", "id", "requestID");
const Event = require('./event');
Request.hasMany(Event, 'events', 'id', 'requestID');
