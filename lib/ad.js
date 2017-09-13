const config = require('../config.json');
const ActiveDirectory = require('activedirectory');
const AD = {};

AD.GetADSession = () => {
    const c = {
        url: config.ldap.url,
        baseDN: config.ldap.searchBase,
        username: config.ldap.bindDn,
        password: config.ldap.bindCredentials
    };
    return new ActiveDirectory(c);
};

AD.GetManager = username => {
    return new Promise((good, bad) => {
        AD.GetUserObject(username)
            .then(user => {
                if (user && user.manager) {
                    AD.GetUserObject(user.manager)
                        .then(managerObject => {
                            const slim = {
                                name: managerObject.name,
                                username: managerObject.sAMAccountName,
                                givenName: managerObject.givenName,
                                distinguishedName: managerObject.distinguishedName,
                                mail: managerObject.mail
                            };
                            return good(slim);
                        }).catch(err => bad(err))
                } else {
                    return bad('manager not found');
                }
            }).catch(err => bad(err));
    })
};

AD.GetUserObject = username => {
    return new Promise((good, bad) => {
        AD.GetADSession().findUser({attributes: ['*']}, username, function (err, user) {
                if (err || !user) {
                    return bad(new Error('User: ' + username + ' not found.'));
                } else {
                    return good(user)
                }
            }
        )
    });
};
module.exports = AD;