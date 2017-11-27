const Q = require('q');
const config = require('./config');


var PersistentStorage = function PersistentStorage(tryAgainFn) {
    var redis = require('redis');
    this.client = redis.createClient(config.REDIS_URL);
};

PersistentStorage.prototype.set = function set(key, data) {
    var dataAsStr = JSON.stringify(data);
    this.client.set(key, dataAsStr);
};

PersistentStorage.prototype.get = function get(key) {
    var deferred = Q.defer();
    var self = this;
    this.client.get(key, function (err, dataAsStr) {
        if (dataAsStr) {
            deferred.resolve(JSON.parse(dataAsStr));
        } else {
            throw new Error('shit');
        }
    });
    return deferred.promise;
};

module.exports = PersistentStorage;
