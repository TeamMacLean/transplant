const thinky = require('../lib/thinky');
const type = thinky.type;
// const r = thinky.r;


const EventGroup = thinky.createModel('EventGroup', {
    id: type.string(),
    requestID: type.string().required(),
    sowDate: type.date().required(),
});

module.exports = EventGroup;


const Request = require('./request');
EventGroup.belongsTo(Request, "request", "requestID", "id");

const Event = require('./event');
EventGroup.hasMany(Event, 'events', 'id', 'eventGroupID');