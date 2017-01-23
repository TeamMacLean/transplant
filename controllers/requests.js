var Requests = {};

const renderError = require('../lib/renderError');
const fs = require('fs');
const config = require('../config.json');

const Request = require('../models/request');

const requestLIB = require('request');

function GetNameFromUsername(username) {

    var found = config.groupLeaders.filter(gl=> {
        return gl.username == username;
    });
    if (found.length > 0) {
        return found[0].name;
    } else {
        return username;
    }
}

function GetAdminInfo(req) {

    return new Promise((good, bad)=> {
        var auth = "Basic " + new Buffer(config.ldap.bindDn + ":" + config.ldap.bindCredentials).toString("base64");

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
                    var parseString = require('xml2js').parseString;
                    parseString(body, function (err, result) {
                        if (err) {
                            return bad(err);
                        } else {

                            // get by username

                            if(!result.SignatoryList){
                                return bad(new Error('No '))
                            }

                            var filterd = result.SignatoryList.Signatory.filter(s=> {
                                return s.userName == req.user.username;
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
Requests.new = (req, res)=> {

    GetAdminInfo(req).then(adminInfo=> {

        var tidyUpAdminObject = {};

        if (adminInfo) {

            var bossUsername = adminInfo.SupervisorUsername[0] || adminInfo.LineManagerUsername[0];

            tidyUpAdminObject = {
                boss: {
                    username: bossUsername,
                    name: GetNameFromUsername(bossUsername)
                },
                cost: adminInfo.CostCentres
            };
        }

        return res.render('requests/new', {adminInfo: tidyUpAdminObject});
    }).catch(err=> {
        return renderError(err, res);
    })

};

function ProcessRequest(body) {

    return new Promise((good, bad)=> {

        var constructs = [];

        // var constructIDs = [];
        for (var key in body) {
            //TODO if(body.hasOwnProperty(key))
            if (key.startsWith('name')) {
                var UID = key.split('name#')[1];
                // constructIDs.push(ID);

                var NAME = body['name#' + UID];
                var BACKBONE = body['backbone#' + UID];
                var TDNA = body['t-dna#' + UID];

                if (!NAME) {
                    return bad(new Error(`No NAME: ${NAME}`))
                }
                if (!BACKBONE) {
                    return bad(new Error(`No BACKBONE: ${BACKBONE}`))
                }
                if (!TDNA) {
                    return bad(new Error(`No TDNA: ${TDNA}`))
                }

                var con = {
                    UID: UID,
                    name: NAME,
                    backbone: BACKBONE,
                    tdna: TDNA,
                    strains: []
                };

                constructs.push(con);

            }
        }

        constructs.map(construct=> {
            for (var key in body) {
                var prefix = 'config-strain#' + construct.UID + '#';
                if (key.startsWith(prefix)) {
                    var UID = key.split(prefix)[1];


                    var strainRetrevial = JSON.parse(body['config-strain#' + construct.UID + '#' + UID]).value.name;

                    var GENOMES = body['config-genotypes#' + construct.UID + '#' + UID];
                    var VECTORS = body['config-vectors#' + construct.UID + '#' + UID];

                    if (!strainRetrevial) {
                        return bad(new Error('no strains'))
                    }
                    if (!GENOMES) {
                        return bad(new Error('no genomes'))
                    }
                    if (!Array.isArray(GENOMES)) {
                        GENOMES = [GENOMES];
                    }
                    if (!VECTORS) {
                        return bad(new Error('no vectors'))
                    }
                    if (!Array.isArray(VECTORS)) {
                        VECTORS = [VECTORS];
                    }

                    var strain = {
                        UID: UID,
                        strain: strainRetrevial,
                        genomes: GENOMES,
                        vectors: VECTORS
                    };
                    construct.strains.push(strain);
                }
            }
        });


        //TODO test all is good

        var DATE = body['date'];
        var NOTES = body['notes'];

        if (!DATE) {
            return bad(new Error('no DATE'))
        }
        if (!NOTES) {
            return bad(new Error('no NOTES'))
        }
        var request = {
            date: DATE,
            notes: NOTES,
            constructs: constructs
        };

        return good(request);
    })
}

/**
 *
 * @param req
 * @param res
 */
Requests.save = (req, res)=> {

    var body = req.body;

    var username = req.user.username;

    ProcessRequest(body)
        .then(request => {
            request.username = username;
            var newRequest = new Request(request);
            newRequest.saveAll({constructs: {strains: true}})
                .then(savedRequest=> {
                    console.log('saved', savedRequest);

                    //TODO send email to group leader to sign off request
                    return res.send('Request Sent Successfully');
                })
                .catch(err=> {
                    //TODO deleteAll on request
                    console.error(err);
                    return res.send(`Request Failed: ${err}`);
                });
        })
        .catch(err=> {
            console.error(err);
            return res.send(`error: ${err}`);
        });

};

Requests.my = (req, res)=> {

    var username = req.user.username;

    Request.filter({username: username})
        .run()
        .then(requests=> {
            return res.render('requests/my', {requests});
        })
        .catch(err=> {
            return renderError(err, res);
        })

};

Requests.show = (req, res)=> {

    var id = req.params.id;

    Request.get(id)
        .getJoin({constructs: {strains: true}})
        .then(request=> {
            return res.render('requests/show', {request});
        })
        .catch(err=> {
            return renderError(err);
        })

};

module.exports = Requests;