// Most of this file is from the https://github.com/axemclion/grunt-saucelabs project

var request = require('request');
var SauceTunnel = require('sauce-tunnel');
var Q = require('q');
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var mime = require('mime');

function log() {
	console.log.apply(this, arguments);
}

var rqst = request.defaults({
	jar: false
});

var resultParsers = {
	qunit: function(result) {
		if (result.passed === undefined) {
			return undefined;
		}

		return result.passed == result.total;
	}
};

var TestResult = function(jobId, user, key, framework, testInterval) {
	var url = 'https://saucelabs.com/rest/v1/' + user + '/js-tests/status';
	var deferred = Q.defer();

	var requestParams = {
		method: 'post',
		url: url,
		auth: {
			user: user,
			pass: key
		},
		json: true,
		body: {
			"js tests": [jobId]
		}
	};

	var checkStatus = function() {
		rqst(requestParams, function(error, response, body) {
			if (error) {
				deferred.resolve({
					passed: undefined,
					result: {
						message: "Error connecting to api to get test status: " + error.toString()
					}
				});

				return;
			}

			var testInfo = body['js tests'][0];

			if (testInfo.status == "test error"){
				deferred.resolve({
					passed: undefined,
					result: {
						message: "Test Error"
					}
				});

				return;
			}

			if (!body.completed){
				setTimeout(checkStatus ,testInterval);
			} else {
				testInfo.passed = testInfo.result ? resultParsers[framework](testInfo.result) : false;
				deferred.resolve(testInfo);
			}
		});
	};

	checkStatus();

	return deferred.promise;
};

var TestRunner = function(user, key, testInterval) {
	this.user = user;
	this.key = key;
	this.url = 'https://saucelabs.com/rest/v1/' + this.user + '/js-tests';
	this.testInterval = testInterval;
	this.results = [];
};

TestRunner.prototype.runTests = function(browsers, urls, framework, tunnelIdentifier, testname, tags, build, onTestComplete, callback) {
	var me = this;
	var numberOfJobs = browsers.length * urls.length;

	var addResultPromise = function(promise){
		me.results.push(promise);

		log(me.results.length, "/", numberOfJobs, 'tests started');

		if (me.results.length == numberOfJobs) {
			Q.all(me.results).then(function(results) {
				results = results.map(function(result) {
					return result.valueOf().passed;
				});

				callback(results);
			});
		}
	};

	urls.forEach(function(url) {
		me.runTest(browsers, url, framework, tunnelIdentifier, testname, tags, build, function(taskIds) {
			taskIds.forEach(function(taskId) {
				var resultPromise = new TestResult(taskId, me.user, me.key, framework, me.testInterval);

				addResultPromise(resultPromise);
				resultPromise.then(function(result) {
					var alteredResult = onTestComplete(result);

					if (alteredResult !== undefined){
						result.passed = alteredResult;
					}

					//log("\nTested %s", url);

					if (result.passed === undefined) {
						log("[FAILED] %s".red, result.platform, result.result.message);
					} else {
						if (result.passed) {
							log("[PASSED] %s".green, result.platform);
						} else {
							log("[FAILED] %s".red, result.platform);
						}
					}

					//log("Url %s", result.url);
				}, function(e) {
					log('some error? %s', e);
				});
			});
		});
	});
};

TestRunner.prototype.runTest = function(browsers, url, framework, tunnelIdentifier, testname, tags, build, callback) {
	var parsePlatforms = function(browsers) {
		return browsers.map(function(browser){
			return [browser.platform || "", browser.browserName || "", browser.version || ""];
		});
	};

	var requestParams = {
		method: 'post',
		url: this.url,
		auth: {
			user: this.user,
			pass: this.key
		},
		json: true,
		body: {
			platforms: parsePlatforms(browsers),
			url: url,
			framework: framework,
			name: testname,
			tags: tags,
			build: build
		}
	};

	if (tunnelIdentifier){
		requestParams.body.tunnel = "tunnel-identifier:" + tunnelIdentifier;
	}

	rqst(requestParams, function(error, response, body) {
		if (error){
			log("Could not connect to Sauce Labs api: %s", error);
			throw error;
		}

		if (!body['js tests'] || !body['js tests'].length) {
			log('Error starting tests through Sauce API: %s', JSON.stringify(body));
			throw new Error('Could not start tests through Sauce API');
		}

		callback(body['js tests']);
	});
};

function configureLogEvents(tunnel) {
	var methods = ['write', 'writeln', 'error', 'ok', 'debug'];

	methods.forEach(function (method) {
		tunnel.on('log:' + method, function (text) {
			log(text);
		});

		tunnel.on('verbose:' + method, function (text) {
			//log(text);
		});
	});
}

function runTask(arg, framework, callback) {
	var test = new TestRunner(arg.username, arg.key, arg.testInterval);
	var webserver = new WebServer();

	webserver.start(function() {
		var tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, arg.tunneled);
		log("Starting Tunnel to Sauce Labs");
		configureLogEvents(tunnel);

		tunnel.start(function(isCreated) {
			if (!isCreated) {
				log("Could not create tunnel to Sauce Labs");
				callback(false);
				webserver.stop();
				return;
			}

			log("Connected to Saucelabs");

			try {
				test.runTests(
					arg.browsers,
					arg.urls,
					framework,
					arg.identifier,
					arg.testname,
					arg.tags,
					arg.build,
					arg.onTestComplete,
					function(status) {
						status = status.every(function(passed){ return passed; });
						//log("All tests completed with status %s", status);
						//log("Stopping Tunnel to Sauce Labs".inverse.bold);
						tunnel.stop(function() {
							callback(status);
						});

						webserver.stop();
					}
				);
			} catch (ex) {
				webserver.stop();
				throw ex;
			}
		});
	});
}

function qunit(settings) {
	var defaults = {
		username: process.env.SAUCE_USERNAME,
		key: process.env.SAUCE_ACCESS_KEY,
		build: process.env.TRAVIS_JOB_ID,
		identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
		tunneled: true,
		tunnelTimeout: 120,
		testInterval: 1000 * 5,
		testReadyTimeout: 1000 * 5,
		testname: 'Tests',
		framework: 'qunit',
		onTestComplete: function() {},
		tags: [],
		urls: ['http://127.0.0.1:9999/tests/index.html'],
		browsers: []
	};

	for (var name in defaults) {
		if (name in settings) {
			continue;
		}

		settings[name] = defaults[name];
	}

	runTask(settings, 'qunit', function() {});
}

function WebServer(settings) {
	var server;

	settings = settings || {};

	this.start = function(callback) {
		server = http.createServer(function(req, res) {
			var uri = url.parse(req.url).pathname;

			if (uri === '/') {
				uri = "index.html";
			}

			var filename = path.join(process.cwd(), uri);
			fs.exists(filename, function(exists) {
					if (!exists) {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end('404 Not Found\n');
						return;
				}

				res.writeHead(200, {'Content-Type': mime.lookup(filename)});
				fs.createReadStream(filename).pipe(res);
			});
		});

		server.listen(settings.port || 9999, settings.host || '0.0.0.0', function() {
			if (settings.verbose) {
				log('Webserver started:', host, 'port', port);
			}

			callback();
		});
	};

	this.stop = function() {
		server.close();
	};
}

exports.saucelabs = {
	qunit: qunit
};
