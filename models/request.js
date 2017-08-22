const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;

const moment = require('moment');

const Request = thinky.createModel('Request', {
    id: type.string(),
    createdAt: type.date().default(r.now()),
    date: type.string().required(),
    approved: type.boolean().default(false),
    denied: type.boolean().default(false),
    username: type.string().required(),
    species: type.string().required(),
    genotypes: type.array().schema(type.string()).required()
});

module.exports = Request;

Request.define('getApprovalString', function () {
    if (this.denied) {
        return 'denied';
    }
    if (this.approved) {
        return 'approved'
    }
    if (!this.approved && !this.denied) {
        return 'pending';
    }
});

Request.define("getStatus", function () {

    const self = this;

    return new Promise(function (good, bad) {

        const nowUnix = moment().unix();

        Request.get(self.id)
            .getJoin({events: true})
            .then(function (request) {

                if (request.events && request.events.length) {

                    let mostRecentEvent = request.events[0];

                    request.events.map(function (event) {
                        const thisUnix = moment(event.date).unix();
                        if (thisUnix < nowUnix && thisUnix > moment(mostRecentEvent.date).unix()) {
                            mostRecentEvent = event;
                        }
                    });

                    self.status = mostRecentEvent.text;
                    return good(mostRecentEvent.text);
                } else {
                    return good('unknown');
                }
            })
            .catch(function (error) {
                return bad(error);
            });
    });

});

const Construct = require('./construct');
Request.hasMany(Construct, "constructs", "id", "requestID");
// const Event = require('./event');
// Request.hasMany(Event, 'events', 'id', 'requestID');
const EventGroup = require('./eventGroup');
Request.hasMany(EventGroup, 'eventGroups', 'id', 'requestID');