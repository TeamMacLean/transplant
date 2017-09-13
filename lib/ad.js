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
        AD.GetUser(username)
            .then(user => {
                if (user && user.manager) {
                    AD.GetUser(user.manager)
                        .then(managerObject => {
                            return good(managerObject);
                        }).catch(err => bad(err))
                } else {
                    return bad('manager not found');
                }
            }).catch(err => bad(err));
    })
};

AD.GetUser = username => {
    return new Promise((good, bad) => {
        AD.GetADSession().findUser({attributes: ['*']}, username, function (err, user) {
                if (err || !user) {
                    return bad(new Error('User: ' + username + ' not found.'));
                } else {
                    return good({
                        name: user.name,
                        username: user.sAMAccountName,
                        givenName: user.givenName,
                        distinguishedName: user.distinguishedName,
                        mail: user.mail,
                        manager: user.manager
                    });
                }
            }
        )
    });
};

AD.GetGroup = username => {
    return new Promise((good, bad) => {
        AD.GetManager(username)
            .then(manager => {
                return good(config.groups.reduce((p, c) => {
                    return c.manager.username === manager.username ? c : p;
                }, {
                    name: "unknown",
                    manager: {
                        name: "unknown",
                        username: "unknown"
                    },
                    color: "#B4B4B7",
                    authorizers: [
                        "unknown"
                    ]
                }));
            })
            .catch(err => bad(err));
    })
};

module.exports = AD;