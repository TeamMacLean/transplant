var Requests = {};

const renderError = require('../lib/renderError');
const fs = require('fs');
const config = require('../config.json');

const Request = require('../models/request');

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

        fs.readFile('./siglist_22_12_16.xml', 'utf8', function (err, contents) {
            if (err) {
                return bad(err);
            } else {
                var parseString = require('xml2js').parseString;
                parseString(contents, function (err, result) {
                    if (err) {
                        return bad(err);
                    } else {
                        //get by username
                        var filterd = result.Signatorylist.Signatory.filter(s=> {
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
 * @param next
 */
Requests.new = (req, res, next)=> {

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

        // console.log('tidy up', tidyUpAdminObject);

        return res.render('requests/new', {adminInfo: tidyUpAdminObject});
    }).catch(err=> {
        return renderError(err, res);
    })

};

/**
 *
 * @param req
 * @param res
 * @param next
 */
Requests.save = (req, res, next)=> {
    //send email to group leader to sign off request

    // console.log();
    // console.log(req.body);
    // console.log();


    var body = req.body;

    console.log(body);

    // var request = {
    //     date: body['date'],
    //     // genotypes: [],//TODO
    //     // constructs: [],
    //     notes: ""
    // };

    //TODO get all construct ids
    var constructIDs = [];
    for (var key in body) {
        if (key.startsWith('name')) {
            constructIDs.push(key.split('name#')[1]);
        }
    }

    console.log(constructIDs);

    //
    // req.body.filter(p=> {
    //     return p.start
    // })
    //
    new Request({
        date: req.body['date'],
        notes: req.body['notes']
    })
        .save()
        .then(saved=> {
            constructIDs.map(constructID=> {
                //TODO create construct document


                //TODO get config ids in construct
                var configIDs = [];
                for (var key in body) {


                    var prefix = 'config-strain#' + constructID + '#';

                    console.log('prefix', prefix);

                    if (key.startsWith(prefix)) {

                        console.log('key', key);

                        configIDs.push(key.split(prefix)[1]);
                    }
                }

                console.log('this construct has', configIDs.length, 'configs');


            })
        })
        .catch(err=> {
            return renderError(err, res);
        });


    // var todo = {
    //
    //     name: req.body['backbone'],
    //     tDNA: req.body['t-dna'],
    // };


    //TODO should I seporate construct + config into their own models?
    //TODO save request


    next();

};

module.exports = Requests;