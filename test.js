const AD = require('./lib/ad');

AD.GetManager('macleand')
    .then(manager => {
        console.log(manager);
    })
    .catch(err => {
        console.error(err);
    });
