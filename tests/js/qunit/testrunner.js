// Quick and dirty testrunner hack, it's ugly but it works
(function() {
	function TestRunner() {
		var suites = [], suiteUrls = [], actions = {};
		var started, currentTest, testUrls = [], globalStats = {};
		var coverObjects = [];

		function get(id) {
			return document.getElementById(id);
		}

		function addClass(elm, cls) {
			if (cls && !hasClass(elm, cls)) {
				elm.className += elm.className ? ' ' + cls : cls;
			}
		}

		function removeClass(elm, cls) {
			if (hasClass(elm, cls)) {
				elm.className = elm.className.replace(new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g"), ' ');
			}
		}

		function hasClass(elm, cls) {
			return elm && cls && (' ' + elm.className + ' ').indexOf(' ' + cls + ' ') !== -1;
		}

		function init() {
			function loadNext() {
				var url = suiteUrls.shift();

				if (url) {
					loadSuite(url, function(json, url) {
						json.baseURL = url.substring(0, url.lastIndexOf('/'));
						if (json.baseURL) {
							json.baseURL += '/';
						}

						suites.push(json);
						loadNext();
					});
				} else {
					render();
					reflow();
					hashToStates();
				}
			}

			loadNext();
		}

		function getHashData() {
			var pos, hash = location.hash, items, item, data = {}, i;

			pos = hash.indexOf('!');
			if (pos > 0) {
				items = hash.substring(pos + 1).split('&');
				for (i = 0; i < items.length; i++) {
					item = items[i].split('=');
					data[item[0]] = item[1];
				}
			}

			return data;
		}

		function setHashData(data) {
			var name, hashItems = [];

			for (name in data) {
				if (data[name] !== null) {
					hashItems.push(name + '=' + data[name]);
				}
			}

			location.hash = '!' + hashItems.join('&');
		}

		function statesToHash() {
			var i, checkboxes, states = [], hasDisabled;

			checkboxes = get('tests').getElementsByTagName("input");
			for (i = 0; i < checkboxes.length; i++) {
				states[i] = checkboxes[i].checked ? '1' : '0';
				hasDisabled = hasDisabled || states[i] === '0';
			}

			setHashData({
				min: get('min').checked,
				jsrobot: get('jsrobot').checked,
				tests: hasDisabled ? states.join('') : null
			});
		}

		function hashToStates() {
			var i, data = getHashData(location.hash), checkboxes;

			if (typeof(data.min) != "undefined") {
				get('min').checked = data.min === "true";
			}

			if (typeof(data.jsrobot) != "undefined") {
				get('jsrobot').checked = data.jsrobot === "true";
			}

			if (typeof(data.tests) != "undefined") {
				checkboxes = get('tests').getElementsByTagName("input");
				for (i = 0; i < checkboxes.length; i++) {
					checkboxes[i].checked = data.tests.substr(i, 1) === '1';
				}
			}
		}

		function addAction(name, action) {
			actions[name] = action;
		}

		function toggleCheckboxes(elm, state) {
			var checkboxes = (elm || get('tests')).getElementsByTagName("input"), i;

			for (i = 0; i < checkboxes.length; i++) {
				checkboxes[i].checked = state;
			}
		}

		function start() {
			var si, ti, tests;

			testUrls = [];
			for (si = 0; si < suites.length; si++) {
				tests = suites[si].tests;
				for (ti = 0; ti < tests.length; ti++) {
					if (get('c' + si + '-' + ti).checked) {
						testUrls.push(tests[ti]);
					}

					removeClass(get('t' + si + '-' + ti), "passed");
					removeClass(get('t' + si + '-' + ti), "failed");
				}
			}

			globalStats = {
				total: 0,
				failed: 0
			};

			// Start first test
			currentTest = testUrls.shift();
			if (currentTest) {
				get('testview').src = currentTest.url + "?min=" + get('min').checked;
			}

			get('coverage').disabled = true;
		}

		function stop() {
			started = false;
			get('testview').src = 'javascript:""';
			get('start').innerHTML = 'start';

			if (coverObjects.length) {
				get('coverage').disabled = false;
			}
		}

		addAction("start", function(elm) {
			started = !started;

			if (started) {
				start();
			} else {
				stop();
				reset();
			}

			elm.innerHTML = started ? 'stop' : 'start';
		});

		addAction("select-none", function(elm) {
			toggleCheckboxes(get('s' + elm.getAttribute("data-suite")), false);
			reset();
		});

		addAction("select-all", function(elm) {
			toggleCheckboxes(get('s' + elm.getAttribute("data-suite")), true);
			reset();
		});

		addAction("select-failed", function(elm) {
			toggleCheckboxes(get('s' + elm.getAttribute("data-suite")), false);
			reset();

			var targetIndex = elm.getAttribute("data-suite");

			for (si = 0; si < suites.length; si++) {
				if (targetIndex !== null && targetIndex != si) {
					continue;
				}

				tests = suites[si].tests;
				for (ti = 0; ti < tests.length; ti++) {
					if (tests[ti].failed) {
						get('c' + si + '-' + ti).checked = true;
					}
				}
			}
		});

		addAction("coverage", function(elm) {
			if (elm.disabled) {
				return;
			}
			showCoverage();
		});

		function render() {
			var si, ti, tests, html = '';

			var div = document.createElement('div');
			addClass(div, "runner");

			html += '<div id="sidebar" class="sidebar" unselectable="true">';
			html += '<div id="controls" class="controls">';
			html += '<div>';
			html += '<button id="start" data-action="start">Start</button>';
			html += '<label><input id="min" type="checkbox" checked>Minified</label>';
			html += '<label><input id="jsrobot" type="checkbox">JSRobot</label>';
			html += '<button id="coverage" data-action="coverage" disabled>Coverage</button>';
			html += '</div>';
			html += '<div>';
			html += '<span id="gstatus" class="gstatus"></span>';
			html += 'Select: ';
			html += '<a data-action="select-all" href="javascript:;">[All]</a> ';
			html += '<a data-action="select-none" href="javascript:;">[None]</a> ';
			html += '<a data-action="select-failed" href="javascript:;">[Failed]</a>';
			html += '</div>';
			html += '</div>';
			html += '<div id="tests" class="tests">';

			for (si = 0; si < suites.length; si++) {
				tests = suites[si].tests;
				html += '<div id="s' + si + '" class="suite"><div class="suite-title">';
				html += '<div class="selection">';
				html += '<a data-action="select-all" data-suite="' + si + '" href="javascript:;">[All]</a> ';
				html += '<a data-action="select-none" data-suite="' + si + '" href="javascript:;">[None]</a> ';
				html += '<a data-action="select-failed" data-suite="' + si + '" href="javascript:;">[Failed]</a>';
				html += '</div>' + suites[si].title;
				html += '</div>';
				for (ti = 0; ti < tests.length; ti++) {
					tests[ti].suiteIndex = si;
					tests[ti].testIndex = ti;
					tests[ti].url = suites[si].baseURL + tests[ti].url;

					html += (
						'<div id="t' + si + '-' + ti + '" class="test">' +
							'<span id="s' + si + '-' + ti + '" class="stats">Running</span>' +
							'<input id="c' + si + '-' + ti + '" type="checkbox" checked />' +
							'<a href="' + tests[ti].url + '" target="testview">' + tests[ti].title + '</a>' +
						'</div>'
					);
				}
				html += '</div>';
			}

			html += '</div>';
			html += '</div>';

			html += '<iframe id="testview" name="testview" src="javascript:\'\'"></iframe>';

			// coverage
			html += '<div id="overlay"></div>'; 
			html += '<div id="coverview">';
			html += '<a class="close" href="javascript:TestRunner.hideCoverage();" title="Close">x</a>';
			html += '<iframe frameborder="0" src="javascript:\'\'"></iframe>';
			html += '</div>';

			div.innerHTML = html;
			document.body.appendChild(div);

			get('sidebar').onclick = function(e) {
				var target;

				e = e || event;
				target = e.target || e.srcElement;

				if ((action = actions[target.getAttribute("data-action")])) {
					action(target);
				}

				statesToHash();
			};
		}

		function addSuites(urls) {
			suiteUrls.push.apply(suiteUrls, urls);
		}

		function loadSuite(url, callback) {
			var xhr;

			function ready() {
				if (xhr.readyState == 4) {
					callback(eval("(" + xhr.responseText + ")"), url);
					xhr = null;
				} else {
					setTimeout(ready, 10);
				}
			}

			xhr = new XMLHttpRequest();

			if (xhr) {
				xhr.open('GET', url, true);
				xhr.send();
				setTimeout(ready, 10);
			}
		}

		function reflow() {
			var viewPortW, viewPortH, sideBarWidth, controlsHeight;

			function rect(id, x, y, w, h) {
				var style, elm;

				if ((elm = get(id))) {
					style = elm.style;
					style.left = x + "px";
					style.top = y + "px";
					style.width = w + "px";
					style.height = h + "px";
				}
			}

			viewPortW = window.innerWidth || document.documentElement.clientWidth;
			viewPortH = window.innerHeight || document.documentElement.clientHeight;

			sideBarWidth = 300;
			controlsHeight = 60;

			rect('testview', sideBarWidth, 0, viewPortW - sideBarWidth, viewPortH);
			rect('sidebar', 0, 0, sideBarWidth, viewPortH);
			rect('controls', 0, 0, sideBarWidth, controlsHeight);
			rect('tests', 0, controlsHeight, sideBarWidth, viewPortH - controlsHeight);
		}

		function reset() {
			var si, tests, ti;

			stop();
			get('gstatus').innerHTML = '';
			removeClass(get("controls"), "failed");

			for (si = 0; si < suites.length; si++) {
				tests = suites[si].tests;
				for (ti = 0; ti < tests.length; ti++) {
					removeClass(get('t' + si + '-' + ti), "passed");
					removeClass(get('t' + si + '-' + ti), "failed");
					removeClass(get('t' + si + '-' + ti), "running");
				}
			}
		}

		function updateGlobalStatus() {
			get('gstatus').innerHTML = 'Total: ' + globalStats.total + ", Failed: " + globalStats.failed;
			addClass(get("controls"), globalStats.failed > 0 ? "failed" : "");
		}

		function done(failed, total) {
			var nextTest, currentTestElm;

			function runNextTest() {
				if ((nextTest = testUrls.shift())) {
					currentTest = nextTest;
					currentTestElm = get('t' + currentTest.suiteIndex + '-' + currentTest.testIndex);
					currentTestElm.scrollIntoView(false);

					if (nextTest.jsrobot === true && !get('jsrobot').checked) {
						get('s' + currentTest.suiteIndex + '-' + currentTest.testIndex).innerHTML = 'Skipped';
						addClass(currentTestElm, "skipped");
						runNextTest();
					} else {
						addClass(currentTestElm, "running");
						get('testview').src = nextTest.url + "?min=" + get('min').checked;
					}
				} else {
					stop();
				}
			}

			if (started) {
				currentTest.failed = failed;
				currentTest.total = total;

				globalStats.total += total;
				globalStats.failed += failed;
				updateGlobalStatus();

				get('s' + currentTest.suiteIndex + '-' + currentTest.testIndex).innerHTML = (
					'(<span class="failed">' + failed + '</span>, ' +
					'<span class="passed">' + (total - failed) + '</span>, ' +
					'<span class="total">' + total + '</span>)'
				);

				addClass(get('t' + currentTest.suiteIndex + '-' + currentTest.testIndex), failed > 0 ? 'failed' : 'passed');
				removeClass(currentTestElm, "running");

				runNextTest();
			}
		}


		function addCoverObject(coverObject) {
			coverObjects.push(coverObject);
		}


		// this is going to be called from the coverage iframe
		function getCoverObject() {
			var coverObject = {}, fileName, gaps, gap, count;

			for (var i = 0, length = coverObjects.length; i < length; i++) {
				for (fileName in coverObjects[i]) {
					gaps = coverObjects[i][fileName];

					if (!coverObject.hasOwnProperty(fileName))	{
						coverObject[fileName] = gaps;
					} else {
						for (gap in gaps) {
							if (gap === '__code') {
								continue;
							}
							count = gaps[gap];
							if (!coverObject[fileName].hasOwnProperty(gap)) {
								coverObject[fileName][gap] = count;
							} else {
								coverObject[fileName][gap] += count;
							}
						}
					}
				}
			}

			return coverObject;
		}

		function showCoverage() {
			var overlay, coverView, viewPortW, viewPortH;

			viewPortW = window.innerWidth || document.documentElement.clientWidth;
			viewPortH = window.innerHeight || document.documentElement.clientHeight;

			overlay = get('overlay');
			overlay.style.display = 'block';

			coverView = get('coverview');
			coverView.style.left = '30px';
			coverView.style.top = '30px';
			coverView.style.width = (viewPortW - 60) + 'px';
			coverView.style.height = (viewPortH - 60) + 'px';
			coverView.style.display = 'block';

			coverView.getElementsByTagName('iframe')[0].src = 'coverage/index.html';
		}

		function hideCoverage() {
			get('overlay').style.display = 'none';
			get('coverview').style.display = 'none';
		}

		return {
			init: init,
			addSuites: addSuites,
			reflow: reflow,
			done: done,
			addCoverObject: addCoverObject,
			getCoverObject: getCoverObject,
			showCoverage: showCoverage,
			hideCoverage: hideCoverage
		};
	}

	var testRunner = new TestRunner();

	self.onload = function() {
		testRunner.init();
	};

	self.onresize = function() {
		testRunner.reflow();
	};

	self.TestRunner = testRunner;
})();
