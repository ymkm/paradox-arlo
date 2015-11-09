var Q = require('q');
var C = require('config');
var U = require('../lib/util');
var _ = require('lodash');
var requestJson = require('request-json');
var request = require('request');
var redis = require('../clients/redis');


// fix up retry logic & expose more methods

function setCameraModeRetryAuthOnFail(mode) {

    return Q.Promise(function (resolve, reject) {
        setCameraMode(mode).then(resolve, function () {

            getNewAuthToken().then(function () {
                setCameraMode(mode).then(resolve,reject);
            },reject);
        })
    });
}

function setCameraMode(mode) {

    return Q.Promise(function (resolve, reject) {

        getUserDetails().then(function (arlo) {
            var client = requestJson.createClient(C.baseUrl);

            var data = {
                from: arlo.userId,
                action: 'set',
                responseUrl: '',
                resource: 'modes',
                transId: U.getTransactionId(),
                publishResponse: true,
                properties: {
                    active: C.modes[mode]
                }
            };

            client.headers = {
                'Authorization': arlo.token,
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json',
                'xcloudId': arlo.xCloudId
            };

            client.post("/hmsweb/users/devices/notify/" + arlo.deviceId, data, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    resolve("Arlo cameras turned " + mode)
                } else {
                    reject(new Error("Could not turn Arlo cameras " + mode + " : " + response.statusCode + " : " + error));
                }
            });
        }, reject)
    });

}

function getUserDetails() {
    return Q.Promise(function (resolve, reject) {
        redis.getAll(C.redisKey).then(function (arlo) {

            if (arlo === null || !arlo['userId'] || !arlo['deviceId'] || !arlo['xCloudId']) {

                getUncachedUserDetails().then(function (arlo) {
                    redis.updateAll(C.redisKey, arlo);
                    resolve(arlo);

                }, reject);
            } else {
                resolve(arlo);
            }
        });
    });
}

function getUncachedUserDetails() {

    return Q.Promise(function (resolve, reject) {

        getAuthToken().then(function (token) {

            if (token === null) {
                throw new Error("token was null");
            }

            var options = {
                url: C.baseUrl + "/hmsweb/users/devices",
                qs: {t: (new Date).getTime()},
                method: 'GET',
                json: true,
                headers: {
                    'Authorization': token,
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Accept': 'application/json',
                    'User-Agent': C.userAgent
                }
            };

            request(options, function (error, response, body) {

                if (!error && response.statusCode == 200) {

                    var baseStationIndex = U.getBaseStationIndex(response.body.data);

                    arloDetails = {
                        "token": token,
                        "userId": response.body.data[baseStationIndex].userId,
                        "deviceId": response.body.data[baseStationIndex].deviceId,
                        "xCloudId": response.body.data[baseStationIndex].xCloudId
                    };
                    resolve(arloDetails);

                } else {
                    reject(new Error("could not get user details : " + response.statusCode + " : " + error));
                }
            });

        }, reject);
    });
}

function getAuthToken() {

    return Q.Promise(function (resolve, reject) {

        redis.get(C.redisKey, "token").then(function (token) {
            if (token === null) {
                getNewAuthToken().then(function (token) {
                    resolve(token)
                }, reject);
            } else {
                resolve(token);
            }
        }, reject);
    });
}

function getNewAuthToken() {

    return Q.Promise(function (resolve, reject) {

        getUncachedAuthToken().then(function (token) {
            redis.update(C.redisKey, "token", token);
            resolve(token)
        }, reject);
    });
}


function getUncachedAuthToken() {

    return Q.Promise(function (resolve, reject) {

        var options = {
            url: C.baseUrl + "/hmsweb/login",
            method: 'POST',
            json: {
                'email': C.email,
                'password': C.password
            },
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json;charset=UTF-8',
                'Accept': 'application/json',
                'User-Agent': C.userAgent
            }
        };

        request(options, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                resolve(response.body.data.token);
            } else {
                reject(new Error("Could not authenticate to Arlo server  : " + response.statusCode + " : " + error));
            }
        });
    });
}

module.exports = {
    setCameraMode: setCameraModeRetryAuthOnFail
};
