'use strict';

var q = require('q');
var request = require('request');

/**
 * Constructs a function that proxies to promiseFactory
 * limiting the count of promises that can run simultaneously.
 * Copied from https://gist.github.com/gaearon/7930162
 *
 * @param promiseFactory function that returns promises.
 * @param limit how many promises are allowed to be running at the same time.
 * @returns function that returns a promise that eventually proxies to promiseFactory.
 */
function limitConcurrency(promiseFactory, limit) {
  var running = 0;
  var semaphore;

  function scheduleNextJob() {
    if (running < limit) {
      running += 1;
      return q();
    }

    if (!semaphore) {
      semaphore = q.defer();
    }

    return semaphore.promise
      .fin(scheduleNextJob);
  }

  function processScheduledJobs() {
    running -= 1;

    if (semaphore && running < limit) {
      semaphore.resolve();
      semaphore = null;
    }
  }

  return function () {
    var _this = this;
    var args = arguments;

    function runJob() {
      return promiseFactory.apply(_this, args);
    }

    return scheduleNextJob()
      .then(runJob)
      .fin(processScheduledJobs);
  };
}

/**
 * Wraps the request call, converts it to a promise. Also formats the errors messages.
 *
 * @param {Object} params - request's parameters object.
 * @returns {Object} - A promise which will eventually be resolved with the response's
 *   body.
 */
function makeRequest(params) {
  return q
    .nfcall(request, params)
    .then(
      function (result) {
        var response = result[0];
        var body = result[1];

        if (response.statusCode !== 200) {
          throw [
            'Unexpected response from the Sauce Labs API.',
            params.method + ' ' + params.url,
            'Response status: ' + response.statusCode,
            'Body: ' + JSON.stringify(body)
          ].join('\n');
        }

        return body;
      },
      function (error) {
        throw 'Could not connect to Sauce Labs API: ' + error.toString();
      }
    );
}

module.exports = {
  limitConcurrency: limitConcurrency,
  makeRequest: makeRequest
};