(function() {
	var iframe, logElement, initSettings, index, testFailures, testTotal, testLog;

	function log(message, failures) {
		var div = document.createElement('div');

		div.className = failures > 0 ? 'fail' : 'pass';
		div.appendChild(document.createTextNode(message));

		logElement.appendChild(div);

		testLog += (failures > 0 ? '[FAILED] ' : '') + message + '\n';
	}

	function runNext() {
		iframe.src = QUnitRunner.tests[index++].url;
	}

	function parseQuery(query) {
		var li, it, i;

		// Parse query string
		li = query.split('&');
		query = {};
		for (i = 0; i < li.length; i++) {
			it = li[i].split('=');
			query[unescape(it[0])] = unescape(it[1]);
		}

		return query;
	}

	// Register done call
	if (top != window && QUnit) {
		QUnit.done = function(failures, total) {
			top.QUnitRunner.done(failures, total, document.title);
		};
	}

	window.QUnitRunner = {
		init: function(settings) {
			var self = this, suites = settings.suites, i, y, html = '', tests;

			this.tests = [];
			for (i = 0; i < suites.length; i++) {
				html += '<h2>' + suites[i].title + '</h2><ul>';
				tests = suites[i].tests;

				for (y = 0; y < tests.length; y++) {
					html += '<li><a href="' + tests[y].url + '">' + tests[y].title + '</a></li>';
				}

				html += '</ul>';

				this.tests = this.tests.concat(tests);
			}

			initSettings = settings;
			this.query = parseQuery(document.location.search.substr(1));

			window.onload = function() {
				document.getElementById('menu').innerHTML = html;

				if (self.query.id) {
					QUnitRunner.run();
				}
			};
		},

		run: function() {
			// Add iframe
			if (!iframe) {
				iframe = document.createElement('iframe');
				iframe.style.position = 'absolute';
				iframe.style.left = '-5000px';
				iframe.style.top = '-5000px';
				iframe.style.width = '1000px';
				iframe.style.height = '1000px';
				document.body.appendChild(iframe);
			}

			// Reset log
			logElement = document.getElementById('log');
			testLog = logElement.innerHTML = '';
			log("Started running all unit tests.");

			// Run tests in iframe
			index = testFailures = testTotal = 0;
			runNext();
		},

		done: function(failures, total, title) {
			testFailures += failures;
			testTotal += total;

			log(title + ". Tests: " + total + ", Failed: " + failures, failures);

			if (index < this.tests.length) {
				runNext();
			} else {
				log("Finished running all tests. Total: " + testTotal + ", Failed: " + testFailures);

				// Post results
				if (this.query.id) {
					this.postResults(this.query.id, testTotal, testFailures, testLog);
				}
			}
		},

		postResults: function(id, total, failed, log) {
			var form = document.createElement('form');

			function addField(name, value) {
				var input = document.createElement('input');

				input.type = 'hidden';
				input.name = name;
				input.value = value;

				form.appendChild(input);
			}

			form.action = '/moxietest/store.php';
			form.method = 'post';

			addField('id', id);
			addField('total', total);
			addField('failed', failed);
			addField('log', log);

			document.body.appendChild(form);
			form.submit();
		}
	};
})();