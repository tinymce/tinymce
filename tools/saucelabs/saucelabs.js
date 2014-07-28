var Q = require('q');
var SauceTunnel = require('sauce-tunnel');
var request = require('request');
var TestRunner = require('./TestRunner');
var WebServer = require('./WebServer');
var chalk = require('chalk');

function getBrowsers(browsers, callback) {
	request('http://saucelabs.com/rest/v1/info/browsers/webdriver', function(error, response, body) {
		var platformLookup = {
			'XP': 'Windows 2012',
			'Windows 7': 'Windows 2008'
		};

		var browserLookup = {
			'googlechrome': 'chrome'
		};

		if (!error && response.statusCode == 200) {
			var allBrowsers = JSON.parse(body);

			allBrowsers.sort(function(a, b) {
				a = parseInt(a.short_version, 10);
				b = parseInt(b.short_version, 10);

				if (a < b) {
					return 1;
				}

				if (a > b) {
					return -1;
				}

				return 0;
			});

			browsers.forEach(function(browser) {
				// Find latest browser and use that
				if (browser.version == 'latest') {
					for (var i = 0; i < allBrowsers.length; i++) {
						var os = platformLookup[browser.platform] || browser.platform;
						var apiName = browserLookup[browser.browserName] || browser.browserName;

						if (allBrowsers[i].api_name == apiName && allBrowsers[i].os == os) {
							browser.version = allBrowsers[i].short_version;
							return;
						}
					}

					delete browser.version;
				}
			});

			callback();
		}
	});
}

function log() {
	console.log.apply(this, arguments);
}

function reportProgress(notification) {
	switch (notification.type) {
		case 'tunnelOpen':
			//log('=> Starting Tunnel to Sauce Labs');
			break;

		case 'tunnelOpened':
			log('Connected to Saucelabs');
			break;

		case 'tunnelClose':
			//log('=> Stopping Tunnel to Sauce Labs');
			break;

		case 'tunnelEvent':
			/*if (notification.verbose) {
				log(notification.text);
			} else {
				log(notification.text);
			}*/
			break;

		case 'jobStarted':
			log(notification.startedJobs, '/', notification.numberOfJobs, 'tests started');
			break;

		case 'jobCompleted':
			if (notification.passed) {
				log(chalk.green("[PASSED] %s"), notification.platform);
			} else {
				log(chalk.red("[FAILED] %s"), notification.platform);
			}

			break;

		case 'testCompleted':
			//log('All tests completed with status %s', notification.passed);
			break;

		case 'retrying':
			log('Timed out, retrying');
			break;

		default:
			log('Unexpected notification type');
	}
}

function createTunnel(arg) {
	var tunnel;

	reportProgress({
		type: 'tunnelOpen'
	});

	tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, true, ['-P', '0'].concat(arg.tunnelArgs));

	['write', 'writeln', 'error', 'ok', 'debug'].forEach(function (method) {
		tunnel.on('log:' + method, function (text) {
			reportProgress({
				type: 'tunnelEvent',
				verbose: false,
				method: method,
				text: text
			});
		});
		tunnel.on('verbose:' + method, function (text) {
			reportProgress({
				type: 'tunnelEvent',
				verbose: true,
				method: method,
				text: text
			});
		});
	});

	return tunnel;
}

function runTask(arg, framework, callback) {
	var tunnel;

	Q.fcall(function () {
		var deferred;

		if (arg.tunneled) {
			deferred = Q.defer();

			tunnel = createTunnel(arg);
			tunnel.start(function (succeeded) {
				if (!succeeded) {
					if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
						deferred.reject(
							'Could not create tunnel to Sauce Labs. ' +
							'Could be the missing SAUCE_USERNAME/SAUCE_ACCESS_KEY environment variables.'
						);
					} else {
						deferred.reject('Could not create tunnel to Sauce Labs');
					}
				} else {
					reportProgress({
						type: 'tunnelOpened'
					});

					deferred.resolve();
				}
			});

			return deferred.promise;
		}
	})
	.then(
		function () {
			var testRunner = new TestRunner(arg, framework, reportProgress);
			return testRunner.runTests();
		}, function (error) {
			log(error.toString());
			callback(false);
		}
	)
	.fin(function () {
		var deferred;

		if (tunnel) {
			deferred = Q.defer();

			reportProgress({
				type: 'tunnelClose'
			});

			tunnel.stop(function () {
				deferred.resolve();
			});

			return deferred.promise;
		}
	})
	.then(
		function (passed) {
			callback(passed);
		},
		function (error) {
			log(error.toString());
			callback(false);
		}
	)
	.done();
}

function qunit(settings) {
	var defaults = {
		username: process.env.SAUCE_USERNAME,
		key: process.env.SAUCE_ACCESS_KEY,
		tunneled: true,
		identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
		pollInterval: 1000 * 2,
		testname: '',
		browsers: [{}],
		tunnelArgs: ['-lsc.log'],
		sauceConfig: {},
		maxRetries: 0
	};

	for (var name in defaults) {
		if (name in settings) {
			continue;
		}

		settings[name] = defaults[name];
	}

	var webServer = new WebServer();

	webServer.start(function() {
		getBrowsers(settings.browsers, function() {
			runTask(settings, 'qunit', function(result) {
				webServer.stop();
			});
		});
	});
}

module.exports.saucelabs = {
	qunit: qunit
};