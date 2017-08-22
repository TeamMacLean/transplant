const Requests = {};

const renderError = require('../lib/renderError');
// const fs = require('fs');
const config = require('../config.json');
const moment = require('moment');
const Event = require('../models/event');
const EventGroup = require('../models/eventGroup');

const Request = require('../models/request');

const requestLIB = require('request');

const THURSDAY = 4;
const MAX_POT_COUNT_PER_WEEK = 6;

/**
 *
 * @param username
 * @returns {*}
 * @constructor
 */
function GetNameFromUsername(username) {
    const found = config.groupLeaders.filter(gl => {
        return gl.username === username;
    });

    if (found.length > 0) {
        return found[0].name;
    } else {
        return username;
    }
}

/**
 *
 * @param req
 * @returns {Promise}
 * @constructor
 */
function GetAdminInfo(req) {

    return new Promise((good, bad) => {
        const auth = "Basic " + new Buffer(config.ldap.bindDn + ":" + config.ldap.bindCredentials).toString("base64");

        requestLIB({
                url: "http://intranet/infoserv/cgi-bin/directory/signatoriesList.asp?username=" + req.user.username,
                headers: {
                    "Authorization": auth
                }
            },
            function (error, response, body) {
                // Do more stuff with 'body' here

                if (error) {
                    return bad(error);
                } else {
                    const parseString = require('xml2js').parseString;
                    parseString(body, function (err, result) {
                        if (err) {
                            return bad(err);
                        } else {

                            if (!result) {
                                return bad(new Error('No Result'))
                            }

                            // get by username
                            if (!result.SignatoryList) {
                                return bad(new Error('No '))
                            }

                            const filterd = result.SignatoryList.Signatory.filter(s => {
                                return s.userName === req.user.username;
                            });
                            if (filterd.length < 1) {
                                return good(null);
                                // return bad('We could not find record of your line-manager/supervisor, we cannot preceded, sorry.')
                                // return renderError('We could not find record of your line-manager/supervisor, we cannot preceded, sorry.', res);
                            }
                            if (filterd.length > 1) {
                                console.error('found user ' + req.user.username + ' more than once in xml');
                            }

                            return good(filterd[0]);
                        }
                    });
                }
            });
    });
}

/**
 *
 * @param req
 * @param res
 */
Requests.new = (req, res) => {

    GetAdminInfo(req).then(adminInfo => {

        let tidyUpAdminObject = {};

        if (adminInfo) {

            const bossUsername = adminInfo.SupervisorUsername[0] || adminInfo.LineManagerUsername[0];

            const prettyCosts = adminInfo.CostCentres.map(c => {

                return {
                    label: c.CostCentre[0],
                    value: c.CostCentre[0]
                }
            });


            tidyUpAdminObject = {
                boss: {
                    username: bossUsername,
                    name: GetNameFromUsername(bossUsername)
                },
                cost: prettyCosts
            };
        }


        return res.render('requests/new', {adminInfo: tidyUpAdminObject});
    }).catch(err => {
        return renderError(err, res);
    })

};

/**
 *
 * @param body
 * @returns {Promise}
 * @constructor
 */
function ProcessRequest(body) {

    return new Promise((good, bad) => {

        const constructs = [];

        const species = body['config-species'];
        let genotypes = body['genotypes'];

        if (!Array.isArray(genotypes)) {
            genotypes = [genotypes];
        }

        if (!species) {
            return bad(new Error('no species selected'));
        }
        if (!genotypes) {
            return bad(new Error('no genotypes selected'));
        }


        // var constructIDs = [];
        for (let key in body) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                if (key.startsWith('name')) {
                    const UID = key.split('name#')[1];
                    // constructIDs.push(ID);

                    let NAME = body['name#' + UID];
                    let BACKBONE = body['backbone#' + UID];
                    let TDNA = body['tdna#' + UID];
                    let VECTORS = body['vectors#' + UID];

                    if (!NAME) {
                        return bad(new Error(`No NAME: ${NAME}`))
                    }
                    if (!BACKBONE) {
                        return bad(new Error(`No BACKBONE: ${BACKBONE}`))
                    }
                    if (!TDNA) {
                        return bad(new Error(`No TDNA: ${TDNA}`))
                    }

                    if (!VECTORS) {
                        return bad(new Error('no vectors'))
                    }

                    ////console.log('vectors', VECTORS);

                    if (!Array.isArray(VECTORS)) {
                        VECTORS = [VECTORS];
                    }

                    const con = {
                        UID: UID,
                        name: NAME,
                        backbone: BACKBONE,
                        tdna: TDNA,
                        strains: [],
                        vectors: VECTORS
                    };

                    constructs.push(con);
                }
            }
        }

        constructs.map(construct => {
            for (let key in body) {
                const prefix = 'config-strain#' + construct.UID + '#';
                if (Object.prototype.hasOwnProperty.call(body, key)) {
                    if (key.startsWith(prefix)) {
                        const UID = key.split(prefix)[1];


                        let strainRetrevial = JSON.parse(body['config-strain#' + construct.UID + '#' + UID]).value.name;

                        let GENOMES = body['config-genotypes#' + construct.UID + '#' + UID];

                        if (!strainRetrevial) {
                            return bad(new Error('no strains'))
                        }
                        if (!GENOMES) {
                            return bad(new Error('no genomes'))
                        }
                        if (!Array.isArray(GENOMES)) {
                            GENOMES = [GENOMES];
                        }

                        const strain = {
                            UID: UID,
                            strain: strainRetrevial,
                            genomes: GENOMES
                        };

                        construct.strains.push(strain);
                    }
                }
            }
        });

        let DATE = body['date'];
        let NOTES = body['notes'];

        if (!DATE) {
            return bad(new Error('no DATE'))
        }
        // if (!NOTES) {
        //     return bad(new Error('no NOTES'))
        // }


        const request = {
            date: DATE,
            notes: NOTES || '',
            constructs: constructs,
            species: species,
            genotypes: genotypes
        };

        return good(request);
    })
}


function getAvailableSowDate() {


    return new Promise((good, bad) => {

        let date = moment().startOf('day');
        date.add(1, 'weeks').isoWeekday(THURSDAY);


        function checkWeek(date) {
            Event.count({
                date: date.toISOString(),
                sowEvent: true
            })
                .execute()
                .then(count => {

                    if (count <= MAX_POT_COUNT_PER_WEEK) {
                        return good(date)
                    } else {
                        return checkWeek(date.add(1, 'weeks'));
                    }

                })
                .catch(err => {
                    return bad(err);
                })
        }

        checkWeek(date); //kick it off

    })
}

function createTimelineEvents(construct, date, eventGroup, isArabadopsis, isCol0) {

    return new Promise((good, bad) => {

        /**
         *
         * NON COL-0 ARABIDOPSIS: LIMIT 36
         * request received
         * plants sown - the next thursday
         * plants in long-day glasshouse - 5 weeks after previous step
         * plants dipped/transformed - 3 weeks after previous step
         * plants bagged - 3 weeks after previous step
         * plants harvested - 3 weeks after previous step
         * seeds returned - 1 week after previous step
         *
         * ARABIDOPSIS COL-0: LIMIT 6
         * request received
         * plants dipped/transformed - 1-2 weeks after received
         * plants bagged - 3 weeks after previous step
         * seed harvested - 4 weeks after previous step
         * seed returned - 1 week after previous step
         *
         * ALL ELSE:
         * request received
         * plant transformed
         * trf complete
         *
         */

        //TODO get available start date

        // let date = moment().startOf('day');
        // const THURSDAY = 4;
        // date.add(1, 'weeks').isoWeekday(THURSDAY);

        //TODO test if


        // let eventGroup = {events: []}; //TODO work on this first

        eventGroup.events = [];

        const reveivedDate = moment().toISOString();

        eventGroup.events.push({
            text: 'request received',
            date: reveivedDate,
            requestID: construct.requestID,
            eventGroupID: eventGroup.id
        });

        if (isArabadopsis) {
            if (!isCol0) { //not col0

                //plants sown - next thursday
                //TODO if(TODAY == mon,tue or wed){do it THIS tursday} else {
                //TODO if constructcount for the last thursday-thursday + (this contruct count * 3) > 48, queue it for the next week (check that week too, recursive)

                date = date.add(1, 'weeks').isoWeekday(THURSDAY);
                eventGroup.events.push({
                    text: 'pants sown',
                    date: date.toISOString(),
                    sowEvent: true,
                    requestID: construct.requestID,
                    eventGroupID: eventGroup.id
                });

                //plants in long day glasshouse - 5 weeks after
                date = date.add(5, 'weeks').isoWeekday(THURSDAY);
                eventGroup.events.push({
                    text: 'plants in long day glasshouse',
                    date: date.toISOString(),
                    requestID: construct.requestID,
                    eventGroupID: eventGroup.id
                });

                //plants dipped - 1-2 weeks after
                date = date.add(2, 'weeks');
                eventGroup.events.push({
                    text: 'plants dipped',
                    date: date.toISOString(),
                    requestID: construct.requestID,
                    eventGroupID: eventGroup.id
                });

            } else {
                //plants dipped - 3 weeks after
                //TODO if the count of col0 constructs this thurs-thurs > 6 do it the following week (recursive check)
                date = date.add(1, 'weeks');
                eventGroup.events.push({
                    text: 'plants dipped',
                    date: date.toISOString(),
                    requestID: construct.requestID,
                    eventGroupID: eventGroup.id
                });
            }

            //plants bagged - 3 weeks after
            date = date.add(3, 'weeks');
            eventGroup.events.push({
                text: 'plants bagged',
                date: date.toISOString(),
                requestID: construct.requestID,
                eventGroupID: eventGroup.id
            });

            //plants harvested - 3 weeks after
            date = date.add(3, 'weeks');
            eventGroup.events.push({
                text: 'plants harvested',
                date: date.toISOString(),
                requestID: construct.requestID,
                eventGroupID: eventGroup.id
            });

            //seeds returned - 1 week after
            date = date.add(1, 'week');
            eventGroup.events.push({
                text: 'seeds returned',
                date: date.toISOString(),
                requestID: construct.requestID,
                eventGroupID: eventGroup.id
            });

        } else {
            //plant transformed
            //trf complete
        }

        ////console.log('returning a');

        return good(eventGroup);

    })
}

/**
 *
 * @param request
 * @returns {Promise}
 */
function createEvents(request) {

   //console.log('create events');

    return new Promise((good, bad) => {

       //console.log('c.e promise');

        let isArabadopsis = false;
        let isCol0 = false;


        if (request.species.toLowerCase().indexOf('arabidopsis') > -1) {
            isArabadopsis = true;

            request.genotypes.map(genomeName => {
                if (genomeName.toLowerCase().indexOf('col-0') || genomeName.toLowerCase().indexOf('col0')) {
                    isCol0 = true;
                }
            });
        }


        function dateEquality(d1, d2) {
            return moment(d1).isSame(moment(d2))
        }

        let lastEventGroup = null;


        function processIt(construct) {

            return new Promise((done, fail) => {

               //console.log('m.t.c promise');

                getAvailableSowDate()
                    .then(momentDate => {

                       //console.log('got available date');

                        if (!lastEventGroup || !dateEquality(momentDate, lastEventGroup.sowDate)) { //if first event group OR if different date given.

                            if (lastEventGroup) {
                               //console.log('got last date');
                               //console.log(momentDate.toISOString(), lastEventGroup.sowDate, dateEquality(momentDate, lastEventGroup.sowDate));
                            } else {
                               //console.log('no last group');
                            }


                           //console.log('DATE GOING IN', momentDate.toISOString());

                            new EventGroup({
                                requestID: request.id,
                                sowDate: momentDate.toISOString()
                            })
                                .save()
                                .then(savedEventGroup => {

                                   //console.log('created event group', savedEventGroup.id);

                                   //console.log('DATE COMING OUT', savedEventGroup.sowDate);

                                    lastEventGroup = savedEventGroup; //important!

                                    createTimelineEvents(construct, momentDate, savedEventGroup, isArabadopsis, isCol0)
                                        .then(eventGroup => {
                                           //console.log('name later done');

                                            return done(eventGroup);
                                        })
                                        .catch(err => {
                                            return fail(err);
                                        });
                                })
                                .catch(err => {
                                    return fail(err);
                                })

                        } else {

                            createTimelineEvents(construct, momentDate, lastEventGroup, isArabadopsis, isCol0)
                                .then(eventGroup => {
                                   //console.log('name later done, 2');
                                    return done(eventGroup)
                                })
                                .catch(err => {
                                    return fail(err)
                                });
                        }
                    })
                    .catch(err => {
                        return fail(err);
                    });
            })
        }

        function processPromiseArrayInSync(array, fn) {
            const results = [];
            return array.reduce(function (p, item) {
                return p.then(function () {
                    return fn(item).then(function (data) {
                        results.push(data);
                        return results;
                    });
                });
            }, Promise.resolve());
        }

        processPromiseArrayInSync(request.constructs, processIt).then(function (events) {
            return good(events);
        }, function (err) {
            return bad(err);
        });
    })
}

/**
 *
 * @param req
 * @param res
 */
Requests.save = (req, res) => {

    const body = req.body;
    const username = req.user.username;

    ProcessRequest(body)
        .then(request => {
            request.username = username;
            const newRequest = new Request(request);
            newRequest.saveAll({constructs: {strains: true}})
                .then(savedRequest => {

                    createEvents(savedRequest)
                        .then(eventGroups => {

                            ////console.log(eventGroups);
                            // process.exit(0);

                            Promise.all(
                                eventGroups.map(eg => {
                                    return eg.events.map(event => {
                                        ////console.log(event);
                                        return new Event(event).save()
                                    })
                                })
                            )
                                .then(savedEvents => {
                                    return res.redirect(`/request/${savedRequest.id}`);
                                })
                                .catch(err => {
                                    //remove saved request if events failed to save
                                    savedRequest.deleteAll({constructs: {strains: true}});
                                    console.error(err);
                                    return res.send(`Failed to save events: ${err}`);
                                })

                        })
                        .catch(err => {
                            //remove saved request if events failed to save
                            savedRequest.deleteAll({constructs: {strains: true}});
                            console.error(err);
                            return res.send(`Failed to save events: ${err}`);
                        })

                })
                .catch(err => {
                    console.error(err);
                    return res.send(`Request Failed: ${err}`);
                });
        })
        .catch(err => {
            console.error(err);
            return res.send(`error: ${err}`);
        });
};

/**
 *
 * @param req
 * @param res
 */
Requests.my = (req, res) => {
    const username = req.user.username;
    Request.filter({username: username})
        .run()
        .then(requests => {

            Promise.all(requests.map(r => {
                return r.getStatus()
            }))
                .then(() => {
                    return res.render('requests/my', {requests});
                })
                .catch(err => renderError(err, res));

        })
        .catch(err => {
            return renderError(err, res);
        })
};

/**
 *
 * @param req
 * @param res
 */
Requests.show = (req, res) => {

    const id = req.params.id;
    Request.get(id)
        .getJoin({constructs: {strains: true}})
        .then(request => {

            request.getStatus()
                .then(() => {
                    return res.render('requests/show', {request});
                })
                .catch(err => renderError(err, res));
        })
        .catch(err => {
            return renderError(err);
        })
};

module.exports = Requests;