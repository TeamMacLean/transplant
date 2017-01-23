const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const Strain = thinky.createModel('Strain', {
    id: type.string(),
    constructID: type.string().required(),
    createdAt: type.date().default(r.now()),
    strain: type.string().required(),
    genomes: [type.string()]
});

module.exports = Strain;

const Construct = require('./construct');
Strain.belongsTo(Construct, "construct", "constructID", "id");