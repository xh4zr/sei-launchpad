const fs = require('fs');
if (fs.existsSync('config.json')) {
    const configObj = require('./config.json');
    for (var key in configObj) {
        if (configObj.hasOwnProperty(key)) {
            process.env[key] = configObj[key];
        }
    }

}

var config = {
    "SEI_ID": process.env.SEI_ID,
    "SEI_SECRET": process.env.SEI_SECRET,
    "SEI_BASE": process.env.SEI_BASE,
    "REDIS_URL": process.env.REDIS_URL
};

module.exports = config;