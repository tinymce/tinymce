(function() {
	var iframe, logElement, initSettings, index, testFailures, testTotal, testLog, currentTest;

	parent.focus();

	function log(message, display) {
		var div;
		
		if (display) {
			div = document.createElement('div');
			div.appendChild(document.createTextNode(message));
			logElement.appendChild(div);
		}

		testLog += message + '\n';
	}

	function runNext() {
		do {
			currentTest = QUnitRunner.tests[index++];

			if (!currentTest || (initSettings.jsrobot_tests || !currentTest.jsrobot))
				break;
		} while (currentTest);

		// We are done
		if (index > QUnitRunner.tests.length)
			return false;

		document.getElementById(currentTest.id + '_status').innerHTML = '(Running)';
		iframe.src = currentTest.url + "?min=" + initSettings.min_tests;

		return true;
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
	if (parent != window && window.QUnit) {
		QUnit.done = function(data) {
			if (parent.QUnitRunner) {
				parent.QUnitRunner.done(data.failed, data.total, document.title);
			} else if (parent.jsCoverageTestDone) {
				parent.jsCoverageTestDone();
			}
		};
	}

	window.QUnitRunner = {
		init: function(settings) {
			var self = this, suites, c, i, y, html = '', tests;

			this.tests = [];
			for (c = 0; c < settings.columns.length; c++) {
				suites = settings.columns[c];
				html += '<div class="column">';
				for (i = 0; i < suites.length; i++) {
					html += '<h2>' + suites[i].title + '</h2><ol>';
					tests = suites[i].tests;

					for (y = 0; y < tests.length; y++) {
						tests[y].id = 'test_' + c + '_' + i + '_' + y;
						tests[y].suite = suites[i];
						html += '<li id="' + tests[y].id + '"><a href="' + tests[y].url + '">' + tests[y].title + '</a> <span id="' + tests[y].id + '_status"></span></li>';
					}

					html += '</ol>';

					this.tests = this.tests.concat(tests);
				}
				html += '</div>';
			}

			html += '<br style="clear: both" />';

			initSettings = settings;
			this.query = parseQuery(document.location.search.substr(1));

			window.onload = function() {
				if (document.location.search.indexOf('min=true') > 0)
					document.getElementById('min').checked = true;

				if (document.location.search.indexOf('jsrobot=false') > 0)
					document.getElementById('jsrobot').checked = false;

				document.getElementById('menu').innerHTML = html;

				if (self.query.id) {
					QUnitRunner.run();
				}
			};
		},

		run: function() {
			var i, y, c;

			// Reset status states
			for (c = 0; c < initSettings.columns.length; c++) {
				suites = initSettings.columns[c];

				for (i = 0; i < suites.length; i++) {
					for (y = 0; y < suites[i].tests.length; y++) {
						document.getElementById(suites[i].tests[y].id).className = '';
					}
				}
			}

			// Add iframe
			if (!iframe) {
				iframe = document.createElement('iframe');
				iframe.style.position = 'absolute';
				iframe.style.right = '0px';
				iframe.style.top = '0px';
				iframe.style.width = '800px';
				iframe.style.height = '100%';
				iframe.style.background = '#fff';
				iframe.style.borderLeft = '1px solid gray';
				document.body.appendChild(iframe);
			}

			// Get min/jsrobot status
			initSettings.min_tests = document.getElementById('min').checked;
			initSettings.jsrobot_tests = document.getElementById('jsrobot').checked;

			// Reset log
			logElement = document.getElementById('log');
			testLog = logElement.innerHTML = '';
			document.getElementById('total_status').className = '';

			// Run tests in iframe
			index = testFailures = testTotal = 0;
			runNext();
		},

		done: function(failures, total, title) {
			testFailures += failures;
			testTotal += total;

			document.getElementById(currentTest.id).className = failures > 0 ? 'fail' : 'pass';
			document.getElementById(currentTest.id + '_status').innerHTML = '<strong><b style="color: black;">(<b class="fail">' + failures + '</b>, <b class="pass">' + (total - failures) + '</b>, ' + total + ')</b></strong>';
			
			if (testFailures > 0)
				document.getElementById('total_status').className = 'fail';

			log((failures > 0 ? "[FAILED]" : "[PASSED]") + " " + currentTest.suite.title + " - " + currentTest.title + ". Tests: " + total + ", Failed: " + failures);

			if (!runNext()) {
				log("Finished running all tests. Total: " + testTotal + ", Failed: " + testFailures, true);
				document.getElementById('total_status').className = testFailures > 0 ? 'fail' : 'pass';
				if (iframe) {
					document.body.removeChild(iframe);
					iframe = null;
				}
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

function provide(tests) {
	QUnitRunner.init({columns: tests});
};