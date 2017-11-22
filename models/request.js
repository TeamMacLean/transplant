const thinky = require('../lib/thinky');
const type = thinky.type;
const r = thinky.r;
const moment = require('moment');
const shortid = require('shortid');
const AD = require('../lib/ad');

const Request = thinky.createModel('Request', {
    id: type.string(),
    uid: type.string(),
    createdAt: type.date().default(r.now()),
    date: type.string().required(),
    approved: type.boolean().default(false),
    denied: type.boolean().default(false),
    username: type.string().required(),
    species: type.string().required(),
    genotypes: type.array().schema(type.string()).required(),
    complete: type.boolean().default(false)
});

module.exports = Request;

Request.pre('save', function (next) {
    if (!this.uid) {
        this.uid = shortid.generate();
    }
    next();
});

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

Request.define('createdHumanDate', function () {
    return moment(this.createdAt).calendar();
});
Request.define('completedHumanDate', function () {
    return moment(this.completedAt).calendar();
});

Request.define("getStatus", function () {

    const self = this;

    return new Promise(function (good, bad) {

        Request.get(self.id)
            .getJoin({eventGroups: {events: true}})
            .then(function (request) {

                // request.eventGroups.reduce((previousGroup, currentGroup) => {
                let mapped = request.eventGroups.map(currentGroup => {


                    let bestEventInGroup = currentGroup.events.reduce((previousEvent, currentEvent) => {
                        let now = moment().unix();
                        let cm = moment(currentEvent.date).unix();
                        let pm = moment(previousEvent.date).unix();

                        // console.log(cm, now, cm < now);
                        // console.log(cm, pm, cm > pm);
                        // console.log(pm === now);

                        return (cm < now && cm > pm) ? currentEvent : previousEvent;
                    }, {date: 0, text: 'unknown'}); //TODO this might return nothing if there have been no events yet*

                    return bestEventInGroup;

                    // let cm = moment(currentGroup).unix();
                    // let pm = moment(previousGroup.date).unix();

                })

                // console.log(mapped);

            });

        self.status = 'WIP';

        return good(self);

    });


    // return new Promise(function (good, bad) {
    //
    //     self.status = 'unknown';
    //
    //     Request.get(self.id)
    //         .getJoin({eventGroups: {events: true}})
    //         .then(function (request) {
    //             if (request.eventGroups && request.eventGroups.length) {
    //
    //                 let mostRecentEvent = request.eventGroups.reduce((prev, current) => {
    //                     let mostRecentInGroup = current.events.reduce((p, c) => {
    //                         return (moment(p.date).unix() < moment(c.date).unix()) && (moment(c.date).unix() <= moment().unix()) ? p : c;
    //                     }, {});
    //
    //
    //                     return (moment(prev.date).unix() > moment(mostRecentInGroup.date).unix()) ? prev : mostRecentInGroup;
    //                 }, {date: 0, text: 'unknown'});
    //                 self.status = mostRecentEvent.text;
    //             }
    //             return good(self);
    //         })
    //         .catch(function (error) {
    //             return bad(error);
    //         });
    // });

});

Request.define("getGroup", function () {
    const self = this;
    return new Promise(function (good, bad) {
        AD.GetGroup(self.username)
            .then(g => {
                self.group = g;
                return good(self);
            })
            .catch(err => {
                console.error(err);
                return bad(err)
            });
    })
});

Request.define("getUser", function () {
    const self = this;
    return new Promise(function (good, bad) {
        AD.GetUser(self.username)
            .then(user => {
                self.user = user;
                return good(self);
            })
            .catch(err => bad(err));
    });
});

const Construct = require('./construct');
Request.hasMany(Construct, "constructs", "id", "requestID");
// const Event = require('./event');
// Request.hasMany(Event, 'events', 'id', 'requestID');
const EventGroup = require('./eventGroup');
Request.hasMany(EventGroup, 'eventGroups', 'id', 'requestID');