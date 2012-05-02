// Gets injected to the end of jscoverage.js so it runs all tests and reports the coverage

var tests = [], testIndex = 0;

function runNextTest() {
	var test = tests[testIndex++];

	if (!test) {
		alert('Tests done.');
		return;
	}

	if (test.url) {
		frames[0].location = document.location.pathname + '/../../../tests/' + test.url + '?coverage=true';
	}
};

function provide(data) {
	function walk(data) {
		if (data.url && !data.jsrobot) {
			tests.push(data);
		} else if (data.tests) {
			walk(data.tests);
		} else {
			for (var i = 0; i < data.length; i++) {
				walk(data[i]);
			}
		}
	};

	walk(data);

	runNextTest();
};

function jsCoverageTestDone() {
	runNextTest();
};

var script = document.createElement('script');
script.src = '../../tests/tests.js';
document.documentElement.appendChild(script);
