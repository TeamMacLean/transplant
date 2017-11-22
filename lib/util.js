const Util = {};

const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const gravatar = require('gravatar');
// const AD = require('ad');
const requestLIB = require('request');
const parseString = require('xml2js').parseString;
const config = require('../config.json');

/**
 * Setup passport
 */
Util.SetupPassport = () => {

    passport.serializeUser((user, done) => {
        //console.log('serializeUser was called');
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        //console.log('deserializeUser was called');
        done(null, obj);
    });

    passport.use(new LdapStrategy({
        server: {
            url: config.ldap.url,
            bindDn: config.ldap.bindDn,
            bindCredentials: config.ldap.bindCredentials,
            searchBase: config.ldap.searchBase,
            searchFilter: config.ldap.searchFilter
        }
    }, (userLdap, done) => {

        // console.log(userLdap);

        const user = {
            id: userLdap.sAMAccountName,
            username: userLdap.sAMAccountName,
            name: userLdap.name,
            mail: userLdap.mail,
            memberOf: userLdap.memberOf,
            iconURL: gravatar.url(userLdap.mail),
            manager: userLdap.manager
        };

        done(null, user);
    }));
};

Util.GetADObject = () => {

    return new AD({
        url: config.ldap.url,
        baseDN: config.ldap.searchBase,
        user: config.ldap.bindDn + '@' + config.email.globalDomain,
        pass: config.ldap.bindCredentials
    });

};

Util.GetUser = username => {
    const ad = Util.GetADObject();
    return ad.user(username).get();
};

/**
 *
 * @param username
 * @returns {Promise}
 * @constructor
 */
Util.GetAdminInfo = username => {


    return new Promise((good, bad) => {
        const auth = "Basic " + new Buffer(config.ldap.bindDn + ":" + config.ldap.bindCredentials).toString("base64");

        requestLIB({
                url: "http://intranet/infoserv/cgi-bin/directory/signatoriesList.asp?username=" + username,
                headers: {
                    "Authorization": auth
                }
            },
            function (error, response, body) {
                // Do more stuff with 'body' here

                if (error) {
                    return bad(error);
                } else {

                    parseString(body, function (err, result) {
                        if (err) {
                            return bad(err);
                        } else {


                            if (!result) {
                                return bad(new Error('No Result'))
                            }

                            // get by username
                            if (!result.SignatoryList) {
                                return bad(new Error('No signatory'))
                            }


                            const filterd = result.SignatoryList.Signatory.filter(s => {

                                return s.userName[0] === username;
                            });
                            if (filterd.length < 1) {
                                return good(null);
                                // return bad('We could not find record of your line-manager/supervisor, we cannot preceded, sorry.')
                                // return renderError('We could not find record of your line-manager/supervisor, we cannot preceded, sorry.', res);
                            }
                            if (filterd.length > 1) {
                                console.error('found user ' + username + ' more than once in xml');
                            }

                            let tidyUpAdminObject = undefined;
                            if (filterd[0]) {

                                const adminInfo = filterd[0];

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
                                        name: Util.GetNameFromUsername(bossUsername)
                                    },
                                    cost: prettyCosts
                                };
                            }


                            return good(tidyUpAdminObject);
                        }
                    });
                }
            });
    });
};

/**
 *
 * @param username
 * @returns {*}
 * @constructor
 */
Util.GetNameFromUsername = username => {

    if (config.groupLeaders) {

        const found = config.groupLeaders.filter(gl => {
            return gl.username === username;
        });

        if (found.length > 0) {
            return found[0].name;
        } else {
            return username;
        }
    } else {
        console.log('list of group leaders not in config.json');
        return 'unknown';
    }
};


/**
 * Determine if current user is an admin
 * @param username
 */
Util.IsAdmin = username => config.admins.indexOf(username) > -1;

// /**
//  * Generate safe name
//  * @param name
//  * @param list
//  * @param cb
//  */
// Util.generateSafeName = (name, list, cb) => { //$path, $filename
//     const safeName = Util.toSafeName(name);
//     var canHave = false;
//     var testName = safeName;
//     var testCount = 1;
//
//     const filter = res => res.safeName === testName;
//
//     while (!canHave) {
//
//         const dupes = list.filter(filter);
//
//         if (dupes.length) {
//             testCount += 1;
//             testName = `${safeName}_${testCount}`;
//         } else {
//             canHave = true;
//             cb(testName);
//         }
//     }
// };

// /**
//  * Get uri safe version of string
//  * @param unsafeName
//  */
// Util.toSafeName = unsafeName => unsafeName.replace('&', 'and').replace(/[^a-z0-9]/gi, '_').toLowerCase();

module.exports = Util;