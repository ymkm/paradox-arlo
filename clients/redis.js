var Q = require('q');
var C = require('config');
var U = require('../lib/util.js');
redis = require('redis');

if (C.redisUrl) {
    var rtg = require("url").parse(C.redisUrl);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

function updateAll(thing, data) {
    redis.hmset(thing, U.stampTime(data), function (err, reply) {

    });
}

function update(thing, key, value) {
    redis.hset(thing, key, value, function (err, reply) {
        if (err) {
            console.error(err);
        }
    });
}

function get(thing, key) {
    return Q.Promise(function (resolve, reject) {

        redis.hget(thing, key, function (error, result) {
            if (error) reject(new Error('error getting' + thing + ' ' + error));
            else {
                resolve(result);
            }
        });
    });
}


function getAll(thing) {
    return Q.Promise(function (resolve, reject) {

        redis.hgetall(thing, function (error, result) {
            if (error) reject(new Error('error getting' + thing + ' ' + error));
            else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    update: update,
    get: get,
    updateAll: updateAll,
    getAll: getAll
};
