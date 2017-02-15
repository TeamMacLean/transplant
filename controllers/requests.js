var Requests = {};

const renderError = require('../lib/renderError');
const fs = require('fs');
const config = require('../config.json');

const Request = require('../models/request');

const requestLIB = require('request');

function GetNameFromUsername(username) {
    const found = config.groupLeaders.filter(gl => {
        return gl.username == username;
    });

    if (found.length > 0) {
        return found[0].name;
    } else {
        return username;
    }
}

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

function ProcessRequest(body) {

    return new Promise((good, bad) => {

        const constructs = [];

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
        if (!NOTES) {
            return bad(new Error('no NOTES'))
        }
        const request = {
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
Requests.save = (req, res) => {

    const body = req.body;
    const username = req.user.username;

    ProcessRequest(body)
        .then(request => {
            request.username = username;
            const newRequest = new Request(request);
            newRequest.saveAll({constructs: {strains: true}})
                .then(savedRequest => {
                    console.log('saved', savedRequest);
                    //TODO send email to group leader to sign off request
                    return res.redirect(`/request/${savedRequest.id}`);
                })
                .catch(err => {
                    //TODO deleteAll on request
                    console.error(err);
                    return res.send(`Request Failed: ${err}`);
                });
        })
        .catch(err => {
            console.error(err);
            return res.send(`error: ${err}`);
        });
};

Requests.my = (req, res) => {
    const username = req.user.username;
    Request.filter({username: username})
        .run()
        .then(requests => {
            return res.render('requests/my', {requests});
        })
        .catch(err => {
            return renderError(err, res);
        })
};

Requests.show = (req, res) => {
    const id = req.params.id;
    Request.get(id)
        .getJoin({constructs: {strains: true}})
        .then(request => {
            return res.render('requests/show', {request});
        })
        .catch(err => {
            return renderError(err);
        })
};

module.exports = Requests;