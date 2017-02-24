const thinky = require('../lib/thinky');
const type = thinky.type;
// const r = thinky.r;

const Event = thinky.createModel('Event', {
    id: type.string(),
    requestID: type.string().required(),
    text: type.string().required(),
    date: type.date().required()
});

module.exports = Event;

const Request = require('./request');
Event.belongsTo(Request, "request", "requestID", "id");