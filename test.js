const AD = require('./lib/ad');

AD.GetManager('macleand')
.then(manager =>{
    console.log('manager is', manager);
})
.catch(err=>{
    console.error(err);
});