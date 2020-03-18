'use strict';

const request = require('request');

const { __ENV__ } = require('../config');
const { logger } = require('./logger');

function logRequest(uri, response) {
    if (__ENV__ === 'test') {
        return;
    }

    logger.info('request', {
        uri,
        timings: response.timings,
    });
}

module.exports = function(uri) {
    return new Promise((resolve, reject) => {
        request(
            {
                uri,

                // Enable timing for logging purposes
                time: true,
            },
            (error, response) => {
                logRequest(uri, response);

                if (error) {
                    return reject(error);
                }

                return resolve(response);
            },
        );
    });
};
