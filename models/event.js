const thinky = require('../lib/thinky');
const type = thinky.type;
// const r = thinky.r;


const Event = thinky.createModel('Event', {
    id: type.string(),
    eventGroupID: type.string().required(),
    text: type.string().required(),
    date: type.date().required(),
    sowEvent: type.boolean().default(false)
});

module.exports = Event;


const EventGroup = require('./eventGroup');
Event.belongsTo(EventGroup, "eventGroup", "eventGroupID", "id");