(function(window) {

	var submitForm = document.getElementById("submitForm");
	
	createSimpleField('id', '');
	createSimpleField('browserId', getParameter('browserId'));
	createSimpleField('userAgent', navigator.userAgent);
	createSimpleField('jsUnitVersion', '2.2');
	createSimpleField('url', window.location.href);
	createSimpleField('cacheBuster', new Date().getTime());
	createSimpleField('userProperty', '');

	var timeField = createSimpleField('time', 0);
	var testCasesField = document.getElementById("testCaseResults");
	
	document.body.appendChild(submitForm);
	
	var runnerFrame = document.getElementById('runner');
	
	var urls = getParameter('urls').split(';');
	var nextUrlIndex = 0;
	
	window.initListener = function() {
		// TODO: Not sure if this will work on all browsers.
		var contentWindow = runnerFrame.contentWindow;
		var QUnit = contentWindow.QUnit;
		
		var testState = {
				moduleName: contentWindow.location + ":",
				messages: ""
		};
		QUnit.log = function(result, message) {
			if (!result && message) {
				testState.messages += message + "\n";
			}
		};
		QUnit.testStart = function(name) {
			testState.testStartTime = new Date().getTime();
			testState.testName = name;
			testState.messages = "";
		};
		QUnit.moduleStart = function(name) {
			testState.moduleName = name + ":";
		};
		QUnit.testDone = function(name, failures, total) {
			addTestResult(testState.moduleName, testState.testName, (new Date().getTime() - testState.testStartTime), failures, testState.messages);
		};
		QUnit.done = function(failures, total) {
			loadNextUrl();
		};
	};
	
	loadNextUrl();
	
	function loadNextUrl() {
		if (nextUrlIndex < urls.length) {
			runnerFrame.src = '/jsunit/' + urls[nextUrlIndex];
			nextUrlIndex++;
		} else {
			submitResults();
		}
	}
		
	function getParameter(name) {
		var matches = window.location.href.match(new RegExp('[&?]' + name + '=([^&]+)'));
		if (matches && matches.length > 1) {
			return matches[1];
		}
	}
	
	function createSimpleField(name, value) {
		var field = document.createElement('input');
		field.name = name;
		field.value = value;
		submitForm.appendChild(field);
		return field;
	}
	
	function addTestResult(moduleName, testName, time, failures, message) {
		var resultOption = document.createElement('option');
		testCasesField.options[testCasesField.options.length] = resultOption;
		resultOption.value = resultOption.innerHTML = moduleName + testName + '|' + (time/1000) + '|' + (failures == 0 ? 'S' : 'F') + '|' + message + '|';
		resultOption.selected = true;
	};
	
	var startTime = new Date().getTime();
	function submitResults() {
		timeField.value = new Date().getTime() - startTime;
		document.body.appendChild(submitForm);
		if (window.location.href.toLowerCase().match(/[?&]submitresults=true/)) {
			submitForm.submit();
		} else {
			submitForm.style.display = "";
		}
	}
})(this);

