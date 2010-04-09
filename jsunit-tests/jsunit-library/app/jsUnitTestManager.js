JsUnit.TestGroup = function() {
    this._testPages = [];
    this._index = 0;
}

JsUnit.TestGroup.prototype.addTestPage = function(testPageUrl) {
    var testPage = new JsUnit.TestPage(testPageUrl);
    JsUnit.Util.push(this._testPages, testPage);
    return testPage;
}

JsUnit.TestGroup.prototype.hasMorePages = function() {
    return this._index < this._testPages.length;
}

JsUnit.TestGroup.prototype.nextPage = function() {
    return this._testPages[this._index++];
}


JsUnit.TestPage = function(url) {
    this.url = url;
    this.tests = [];

    this.running = false;

    this.successCount = 0;
    this.errorCount = 0;
    this.failureCount = 0;

    this._listeners = [];
}

JsUnit.TestPage.STATUS_CHANGE_EVENT = "statusChange";
JsUnit.TestPage.READY_EVENT = "ready";

JsUnit.TestPage.prototype.addTest = function(testName) {
    var test = new JsUnit.Test(this, testName);
    JsUnit.Util.push(this.tests, test);
    return test;
}

JsUnit.TestPage.prototype.listen = function(callback) {
    JsUnit.Util.push(this._listeners, callback);
}

JsUnit.TestPage.prototype.notify = function(event) {
    for (var i = 0; i < this._listeners.length; i++) {
        this._listeners[i].call(null, this, event);
    }
}

JsUnit.TestPage.prototype.getStatus = function(testName) {
    if (this.tests.length == 0) return 'noTestsYet';
    if (this.running) return 'running';

    if (this.errorCount > 0) return 'error';
    if (this.failureCount > 0) return 'failure';
    if (this.successCount > 0) return 'success';
    return 'ready';
}

JsUnit.Test = function(testPage, testName) {
    this.testPage = testPage;
    this.testName = testName;
    this.traceMessages = [];
    this.status = 'ready';

    this._listeners = [];
}

JsUnit.Test.prototype.addTraceMessage = function(traceMessage) {
    this.traceMessages.push(traceMessage);
}

JsUnit.Test.prototype.listen = function(callback) {
    JsUnit.Util.push(this._listeners, callback);
}

JsUnit.Test.prototype.notify = function(event) {
    for (var i = 0; i < this._listeners.length; i++) {
        this._listeners[i].call(null, this, event);
    }
}


JsUnit.TraceMessage = function(message, value, traceLevel) {
    this.message = message;
    this.value = value;
    this.traceLevel = traceLevel;
}

function JsUnitTestManager(params) {
    this._params = params || new JsUnit.Params();

    this.log = [];

    this._baseURL = "";

    this.setup();

    if (this._params.get("ui") == "modern") {
        this._uiManager = new JsUnit.ModernUiManager(this);
    } else {
        this._uiManager = new JsUnit.ClassicUiManager(this);
    }
}

JsUnitTestManager.prototype.getUiManager = function() {
    return this._uiManager;
}

JsUnitTestManager.prototype.getUiFrameUrl = function() {
    return this._uiManager.getUiFrameUrl();
}

// call after all frames have loaded
JsUnitTestManager.prototype.onLoad = function() {
    var topLevelFrames = top.frames;

    this.container = topLevelFrames.testContainer;
    this.documentLoader = topLevelFrames.documentLoader;

    this.containerController = this.container.frames.testContainerController;
    this.testFrame = this.container.frames.testFrame;

    this._uiManager.onLoad(topLevelFrames.mainFrame);

    this.resultsFrame = topLevelFrames.mainResults;
    this.resultsForm = this.resultsFrame.document.resultsForm;
    this.testCaseResultsField = this.resultsFrame.document.resultsForm.testCaseResults;
    this.resultsTimeField = this.resultsFrame.document.resultsForm.time;

    var testRunnerFrameset = document.getElementById('testRunnerFrameset');
    if (this._params.shouldShowTestFrame() && testRunnerFrameset) {
        testRunnerFrameset.rows = '*,0,0,' + this._params.getShowTestFrameHeight();
    }
}

// seconds to wait for each test page to load
JsUnitTestManager.TESTPAGE_WAIT_SEC = 10;

// milliseoncds between test runs
JsUnitTestManager.TIMEOUT_LENGTH = 20;

// seconds to wait for setUpPage to complete
JsUnitTestManager.SETUPPAGE_TIMEOUT = 10;

// milliseconds to wait between polls on setUpPages
JsUnitTestManager.SETUPPAGE_INTERVAL = 100;

JsUnitTestManager.RESTORED_HTML_DIV_ID = "jsUnitRestoredHTML";

JsUnitTestManager.DEFAULT_TEST_FRAME_HEIGHT = 250;


JsUnitTestManager.prototype.setup = function () {
    this.totalCount = 0;
    this.errorCount = 0;
    this.failureCount = 0;
    this._testGroupStack = Array();

    var initialSuite = new JsUnitTestSuite();
    this.addTestSuite(initialSuite);
}

JsUnitTestManager.prototype.getTracer = function () {
    return top.tracer;
}

JsUnitTestManager.prototype.maybeRun = function () {
    if (this._params.shouldKickOffTestsAutomatically()) {
        this.kickOffTests();
    }
}

JsUnitTestManager.prototype.addTestSuite = function(testSuite) {
    var testGroup = new JsUnit.TestGroup();

    while (testSuite.hasMorePages()) {
        var testPage = testGroup.addTestPage(testSuite.nextPage());
        this.notifyUiOfTestPage(testPage);
    }

    JsUnit.Util.push(this._testGroupStack, testGroup);
}

JsUnitTestManager.prototype.kickOffTests = function() {
    if (JsUnit.Util.isBlank(this.getTestFileName())) {
        this.fatalError('No Test Page specified.');
        return;
    }

    this.setup();

    this._currentTestGroup().addTestPage(this.resolveUserEnteredTestFileName());

    this.start();
}

JsUnitTestManager.prototype.start = function () {
    var url = this.resolveUserEnteredTestFileName();
    this._baseURL = this._determineBaseUrl(url);

    this._timeRunStarted = new Date();
    this.initialize();
    setTimeout('top.testManager._nextPage();', JsUnitTestManager.TIMEOUT_LENGTH);
}

JsUnitTestManager.prototype._determineBaseUrl = function (url) {
    var firstQuery = url.indexOf("?");
    if (firstQuery >= 0) {
        url = url.substring(0, firstQuery);
    }
    var lastSlash = url.lastIndexOf("/");
    var lastRevSlash = url.lastIndexOf("\\");
    if (lastRevSlash > lastSlash) {
        lastSlash = lastRevSlash;
    }
    if (lastSlash > 0) {
        url = url.substring(0, lastSlash + 1);
    }
    return url;
}

JsUnitTestManager.prototype.getBaseURL = function () {
    return this._baseURL;
}

JsUnitTestManager.prototype.notifyUiOfTestPage = function(testPage) {
    if (testPage.alreadyNotifiedUi) return;

    this._uiManager.learnedOfTestPage(testPage);
    testPage.alreadyNotifiedUi = true;
}

JsUnitTestManager.prototype.doneLoadingPage = function(testPage) {
    this.notifyUiOfTestPage(testPage);
    this._currentTestPage = testPage;
    if (this.isTestPageSuite())
        this._handleNewSuite();
    else
    {
        this._testIndex = 0;
        var testNames = this.getTestFunctionNames();
        for (var i = 0; i < testNames.length; i++) {
            testPage.addTest(testNames[i]);
        }
        testPage.notify(JsUnit.TestPage.READY_EVENT);
        this._numberOfTestsInPage = testNames.length;
        this._runTest();
    }
}

JsUnitTestManager.prototype._handleNewSuite = function () {
    var allegedSuite = this.testFrame.suite();
    if (allegedSuite.isJsUnitTestSuite) {
 		var newSuite = this._cloneTestSuite(allegedSuite);
        if (newSuite.containsTestPages())
            this.addTestSuite(newSuite);
        this._nextPage();
    }
    else {
        this.fatalError('Invalid test suite in file ' + this._currentTestPage.url);
        this.abort();
    }
}

/**
* This function handles cloning of a jsUnitTestSuite object.  This was added to replace the clone method of the jsUnitTestSuite class due to an IE bug in cross frame scripting. (See also jsunit bug 1522271)
**/
JsUnitTestManager.prototype._cloneTestSuite = function(suite) {
	var clone = new jsUnitTestSuite();
	clone._testPages = suite._testPages.concat(new Array(0));
	return clone;
}

JsUnitTestManager.prototype._runTest = function () {
    if (this._testIndex + 1 > this._numberOfTestsInPage) {
        // execute tearDownPage *synchronously*
        // (unlike setUpPage which is asynchronous)
        if (typeof this.testFrame.tearDownPage == 'function') {
            this.testFrame.tearDownPage();
        }

        this._currentTestPage.running = false;
        this._currentTestPage.notify(JsUnit.TestPage.STATUS_CHANGE_EVENT);

        this._nextPage();
        return;
    }

    if (this._testIndex == 0) {
        this._currentTestPage.running = true;
        this._currentTestPage.notify(JsUnit.TestPage.STATUS_CHANGE_EVENT);

        this.storeRestoredHTML();
        if (typeof(this.testFrame.setUpPage) == 'function') {
            // first test for this page and a setUpPage is defined
            if (typeof(this.testFrame.setUpPageStatus) == 'undefined') {
                // setUpPage() not called yet, so call it
                this.testFrame.setUpPageStatus = false;
                this.testFrame.startTime = new Date();
                this.testFrame.setUpPage();
                // try test again later
                setTimeout('top.testManager._runTest()', JsUnitTestManager.SETUPPAGE_INTERVAL);
                return;
            }

            if (this.testFrame.setUpPageStatus != 'complete') {
                this.setWindowStatus('setUpPage not completed... ' + this.testFrame.setUpPageStatus + ' ' + (new Date()));
                if ((new Date() - this.testFrame.startTime) / 1000 > this.getsetUpPageTimeout()) {
                    this.fatalError('setUpPage timed out without completing.');
                    if (!this.userConfirm('Retry Test Run?')) {
                        this.abort();
                        return;
                    }
                    this.testFrame.startTime = (new Date());
                }
                // try test again later
                setTimeout('top.testManager._runTest()', JsUnitTestManager.SETUPPAGE_INTERVAL);
                return;
            }
        }
    }

    this.setWindowStatus('');
    // either not first test, or no setUpPage defined, or setUpPage completed

    var theTest = this._currentTestPage.tests[this._testIndex];
    theTest.status = 'running';
    theTest.notify('statusChange');
    // todo: need to yield back so display will update here...

    this.executeTestFunction(theTest);
    this.totalCount++;
    this.updateProgressIndicators();
    this._testIndex++;
    setTimeout('if (top.testManager) top.testManager._runTest()', JsUnitTestManager.TIMEOUT_LENGTH);
}

JsUnitTestManager.prototype.setWindowStatus = function(string) {
    top.status = string;
}

JsUnitTestManager.prototype._populateHeaderFields = function(id, browserId, userAgent, jsUnitVersion, baseURL) {
    this.resultsForm.id.value = id;
    this.resultsForm.browserId.value = browserId;
    this.resultsForm.userAgent.value = userAgent;
    this.resultsForm.jsUnitVersion.value = jsUnitVersion;
    this.resultsForm.url.value = baseURL;
    this.resultsForm.cacheBuster.value = new Date().getTime();
}

JsUnitTestManager.prototype._submitResultsForm = function() {
    var testCasesField = this.testCaseResultsField;
    for (var i = 0; i < testCasesField.length; i++) {
        testCasesField[i].selected = true;
    }

    this.resultsForm.action = this.getSubmitUrl();
    this.resultsForm.submit();
}

JsUnitTestManager.prototype.submitResults = function() {
    this._uiManager.submittingResults();
    this._populateHeaderFields(this._params.getResultId(), this._params.getBrowserId(), navigator.userAgent, JSUNIT_VERSION, this.resolveUserEnteredTestFileName());
    this._submitResultsForm();
}

JsUnitTestManager.prototype._done = function () {
    var secondsSinceRunBegan = (new Date() - this._timeRunStarted) / 1000;
    this.setStatus('Done (' + secondsSinceRunBegan + ' seconds)');

    // call the suite teardown function, if defined
    if( typeof top.suiteTearDown === 'function' ) {
        top.suiteTearDown();
    }

    this._cleanUp();
    if (this._params.shouldSubmitResults()) {
        this.resultsTimeField.value = secondsSinceRunBegan;
        this.submitResults();
    }
}

JsUnitTestManager.prototype._nextPage = function () {
    this._restoredHTML = null;
    if (this._currentTestGroup().hasMorePages()) {
        var testPage = this._currentTestGroup().nextPage();
        this.loadPage(testPage);
    }
    else {
        JsUnit.Util.pop(this._testGroupStack);
        if (this._currentTestGroup() == null)
            this._done();
        else
            this._nextPage();
    }
}

JsUnitTestManager.prototype._currentTestGroup = function () {
    var suite = null;

    if (this._testGroupStack && this._testGroupStack.length > 0)
        suite = this._testGroupStack[this._testGroupStack.length - 1];

    return suite;
}

JsUnitTestManager.prototype.calculateProgressBarProportion = function () {
    if (this.totalCount == 0)
        return 0;
    var currentDivisor = 1;
    var result = 0;

    for (var i = 0; i < this._testGroupStack.length; i++) {
        var testGroup = this._testGroupStack[i];
        currentDivisor *= testGroup._testPages.length;
        result += (testGroup._index - 1) / currentDivisor;
    }
    result += (this._testIndex + 1) / (this._numberOfTestsInPage * currentDivisor);
    return result;
}

JsUnitTestManager.prototype._cleanUp = function () {
    this.containerController.setTestPage('./app/emptyPage.html');
    this.finalize();
}

JsUnitTestManager.prototype.abort = function () {
    this.setStatus('Aborted');
    this._cleanUp();
}

JsUnitTestManager.prototype.getTimeout = function () {
    var result = JsUnitTestManager.TESTPAGE_WAIT_SEC;
    try {
        result = eval(this.timeout.value);
    }
    catch (e) {
    }
    return result;
}

JsUnitTestManager.prototype.getsetUpPageTimeout = function () {
    var result = JsUnitTestManager.SETUPPAGE_TIMEOUT;
    try {
        result = eval(this.setUpPageTimeout.value);
    }
    catch (e) {
    }
    return result;
}

JsUnitTestManager.prototype.isTestPageSuite = function () {
    var result = false;
    if (typeof(this.testFrame.suite) == 'function')
    {
        result = true;
    }
    return result;
}

JsUnitTestManager.prototype.isTestFunction = function(propertyName, obj) {
    return propertyName.substring(0, 4) == 'test' && typeof(obj[propertyName]) == 'function';
}

JsUnitTestManager.prototype.getTestFunctionNames = function () {
    return this.getTestFunctionNamesFromExposedTestFunctionNames(this.testFrame) ||
        this.getTestFunctionNamesFromFrameProperties(this.testFrame) ||
        this.getTestFunctionNamesFromRuntimeObject(this.testFrame) ||
        this.getTestFunctionNamesUsingPlainTextSearch(this.testFrame);
}

JsUnitTestManager.prototype.getTestFunctionNamesFromExposedTestFunctionNames = function (testFrame) {
    if (testFrame && typeof(testFrame.exposeTestFunctionNames) == 'function') {
        return testFrame.exposeTestFunctionNames();
    } else {
        return null;
    }
}

JsUnitTestManager.prototype.getTestFunctionNamesFromFrameProperties = function (testFrame) {
    var testFunctionNames = [];

    for (var i in testFrame) {
        if (this.isTestFunction(i, testFrame)) {
            JsUnit.Util.push(testFunctionNames, i);
        }
    }

    return testFunctionNames.length > 0 ? testFunctionNames : null;
}

JsUnitTestManager.prototype.getTestFunctionNamesFromRuntimeObject = function (testFrame) {
    var testFunctionNames = [];

    if (testFrame.RuntimeObject) {
        var runtimeObject = testFrame.RuntimeObject("test*");
        for (var i in runtimeObject) {
            if (this.isTestFunction(i, runtimeObject)) {
                JsUnit.Util.push(testFunctionNames, i);
            }
        }
    }

    return testFunctionNames.length > 0 ? testFunctionNames : null;
}

/**
 * Method of last resort. This will pick up functions that are commented-out and will not be able to pick up
 * tests in included JS files.
 */
JsUnitTestManager.prototype.getTestFunctionNamesUsingPlainTextSearch = function (testFrame) {
    var testFunctionNames = [];

    if (testFrame &&
        testFrame.document &&
        typeof(testFrame.document.scripts) != 'undefined' &&
        testFrame.document.scripts.length > 0) { // IE5 and up
        var scriptsInTestFrame = testFrame.document.scripts;

        for (i = 0; i < scriptsInTestFrame.length; i++) {
            var someNames = this._extractTestFunctionNamesFromScript(scriptsInTestFrame[i]);
            if (someNames) {
                testFunctionNames = testFunctionNames.concat(someNames);
            }
        }
    }

    return testFunctionNames.length > 0 ? testFunctionNames : null;
}

JsUnitTestManager.prototype._extractTestFunctionNamesFromScript = function (aScript) {
    var result;
    var remainingScriptToInspect = aScript.text;
    var currentIndex = this._indexOfTestFunctionIn(remainingScriptToInspect);
    while (currentIndex != -1) {
        if (!result)
            result = new Array();

        var fragment = remainingScriptToInspect.substring(currentIndex, remainingScriptToInspect.length);
        result = result.concat(fragment.substring('function '.length, fragment.indexOf('(')));
        remainingScriptToInspect = remainingScriptToInspect.substring(currentIndex + 12, remainingScriptToInspect.length);
        currentIndex = this._indexOfTestFunctionIn(remainingScriptToInspect);
    }
    return result;
}

JsUnitTestManager.prototype._indexOfTestFunctionIn = function (string) {
    return string.indexOf('function test');
}

JsUnitTestManager.prototype.loadPage = function (testPage) {
    this._currentTestPage = testPage;
    this._loadAttemptStartTime = new Date();
    this.setStatus('Opening Test Page "' + this._currentTestPage.url + '"');
    this.containerController.setTestPage(this._currentTestPage.url);
    this._callBackWhenPageIsLoaded();
}

JsUnitTestManager.prototype._callBackWhenPageIsLoaded = function () {
    if ((new Date() - this._loadAttemptStartTime) / 1000 > this.getTimeout()) {
        this.fatalError('Reading Test Page ' + this._currentTestPage.url + ' timed out.\nMake sure that the file exists and is a Test Page.');
        if (this.userConfirm('Retry Test Run?')) {
            this.loadPage(this._currentTestPage);
            return;
        } else {
            this.abort();
            return;
        }
    }
    if (!this._isTestFrameLoaded()) {
        setTimeout('if (top.testManager) top.testManager._callBackWhenPageIsLoaded();', JsUnitTestManager.TIMEOUT_LENGTH);
        return;
    }
    this.doneLoadingPage(this._currentTestPage);
}

JsUnitTestManager.prototype._isTestFrameLoaded = function () {
    try {
        return this.containerController.isPageLoaded();
    }
    catch (e) {
    }
    return false;
}

JsUnitTestManager.prototype.executeTestFunction = function (theTest) {
    this._currentTest = theTest;
    this._testFunctionName = theTest.testName;
    this.setStatus('Running test "' + this._testFunctionName + '"');
    var exception = null;
    var timeBefore = new Date();
    try {
        if (this._restoredHTML)
            this.testFrame.document.getElementById(JsUnitTestManager.RESTORED_HTML_DIV_ID).innerHTML = this._restoredHTML;
        if (this.testFrame.setUp !== JSUNIT_UNDEFINED_VALUE)
            this.testFrame.setUp();
        this.testFrame[this._testFunctionName]();
    }
    catch (e1) {
        exception = e1;
    }
    finally {
        try {
            if (this.testFrame.tearDown !== JSUNIT_UNDEFINED_VALUE)
                this.testFrame.tearDown();
        }
        catch (e2) {
            //Unlike JUnit, only assign a tearDown exception to excep if there is not already an exception from the test body
            if (exception == null)
                exception = e2;
        }
    }
    theTest.timeTaken = new Date() - timeBefore;

    var timeTaken = theTest.timeTaken / 1000;
    this._setTestStatus(theTest, exception);
    this._uiManager.testCompleted(theTest);

    var serializedTestCaseString = this._currentTestFunctionNameWithTestPageName(true) + "|" + timeTaken + "|";
    if (exception == null)
        serializedTestCaseString += "S||";
    else {
        if (exception.isJsUnitFailure)
            serializedTestCaseString += "F|";
        else {
            serializedTestCaseString += "E|";
        }
        serializedTestCaseString += this._uiManager.problemDetailMessageFor(exception);
    }
    this._addOption(this.testCaseResultsField,
            serializedTestCaseString,
            serializedTestCaseString);
}

JsUnitTestManager.prototype._currentTestFunctionNameWithTestPageName = function(useFullyQualifiedTestPageName) {
    var testURL = this.testFrame.location.href;
    var testQuery = testURL.indexOf("?");
    if (testQuery >= 0) {
        testURL = testURL.substring(0, testQuery);
    }
    if (!useFullyQualifiedTestPageName) {
        if (testURL.substring(0, this._baseURL.length) == this._baseURL)
            testURL = testURL.substring(this._baseURL.length);
    }
    return testURL + ':' + this._testFunctionName;
}

JsUnitTestManager.prototype._addOption = function(listField, problemValue, problemMessage) {
    if (typeof(listField.ownerDocument) != 'undefined'
            && typeof(listField.ownerDocument.createElement) != 'undefined') {
        // DOM Level 2 HTML method.
        // this is required for Opera 7 since appending to the end of the
        // options array does not work, and adding an Option created by new Option()
        // and appended by listField.options.add() fails due to WRONG_DOCUMENT_ERR
        var problemDocument = listField.ownerDocument;
        var errOption = problemDocument.createElement('option');
        errOption.setAttribute('value', problemValue);
        errOption.appendChild(problemDocument.createTextNode(problemMessage));
        listField.appendChild(errOption);
    }
    else {
        // new Option() is DOM 0

        var errOption = new Option(problemMessage, problemValue);

        if (typeof(listField.add) != 'undefined') {
            // DOM 2 HTML
            try {
                listField.add(errOption, null);
            } catch(err) {
                listField.add(errOption); // IE 5.5
            }

        }
        else if (typeof(listField.options.add) != 'undefined') {
            // DOM 0
            listField.options.add(errOption, null);
        }
        else {
            // DOM 0
            listField.options[listField.length] = errOption;
        }
    }
}

JsUnitTestManager.prototype._setTestStatus = function (test, excep) {
    var message = this._currentTestFunctionNameWithTestPageName(false) + ' ';

    if (excep == null) {
        test.status = 'success';
        test.testPage.successCount++;
        message += 'passed';
    } else {
        test.exception = excep;

        if (!excep.isJsUnitFailure) {
            this.errorCount++;
            test.status = 'error';
            test.testPage.errorCount++;
            message += 'had an error';
        }
        else {
            this.failureCount++;
            test.status = 'failure';
            test.testPage.failureCount++;
            message += 'failed';
        }
    }

    test.message = message;
}

JsUnitTestManager.prototype.setStatus = function (str) {
    this._uiManager.setStatus(str);
    this.log.push(str);
}

JsUnitTestManager.prototype.updateProgressIndicators = function () {
    this._uiManager.updateProgressIndicators(
            this.totalCount,
            this.errorCount,
            this.failureCount,
            this.calculateProgressBarProportion()
            );
}

JsUnitTestManager.prototype.initialize = function () {
    this.setStatus('Initializing...');
    this._uiManager.starting();
    this.updateProgressIndicators();
    this.setStatus('Done initializing');
}

JsUnitTestManager.prototype.finalize = function () {
    this._uiManager.finishing();
}

JsUnitTestManager.prototype.getTestFileName = function () {
    var rawEnteredFileName = this._uiManager.getTestFileName();
    var result = rawEnteredFileName;

    while (result.indexOf('\\') != -1)
        result = result.replace('\\', '/');

    return result;
}

JsUnitTestManager.prototype.getTestFunctionName = function () {
    return this._testFunctionName;
}

JsUnitTestManager.prototype.resolveUserEnteredTestFileName = function (rawText) {
    var userEnteredTestFileName = this.getTestFileName();

    // only test for file:// since Opera uses a different format
    if (userEnteredTestFileName.indexOf('http://') == 0 || userEnteredTestFileName.indexOf('https://') == 0 || userEnteredTestFileName.indexOf('file://') == 0)
        return userEnteredTestFileName;

    return this.getTestFileProtocol() + this.getTestFileName();
}

JsUnitTestManager.prototype.storeRestoredHTML = function () {
    if (document.getElementById && this.testFrame.document.getElementById(JsUnitTestManager.RESTORED_HTML_DIV_ID))
        this._restoredHTML = this.testFrame.document.getElementById(JsUnitTestManager.RESTORED_HTML_DIV_ID).innerHTML;
}

JsUnitTestManager.prototype.fatalError = function(aMessage) {
    this._uiManager.fatalError(aMessage);
}

JsUnitTestManager.prototype.userConfirm = function(aMessage) {
    return this._uiManager.userConfirm(aMessage);
}

JsUnitTestManager.DEFAULT_SUBMIT_WEBSERVER = "localhost:8080";

JsUnitTestManager.prototype._submitUrlFromSpecifiedUrl = function() {
    var result = "";
    var specifiedUrl = this._params.getSpecifiedResultUrl();
    if (specifiedUrl.indexOf("http://") != 0)
        result = "http://";
    result += specifiedUrl;
    return result;
}

JsUnitTestManager.prototype._submitUrlFromTestRunnerLocation = function() {
    var result = "http://";
    var webserver = this.getWebserver();
    var runningOverFileProtocol = webserver == null;
    if (runningOverFileProtocol)
        webserver = JsUnitTestManager.DEFAULT_SUBMIT_WEBSERVER;
    result += webserver;
    result += "/jsunit/acceptor";
    return result;
}

JsUnitTestManager.prototype.getSubmitUrl = function() {
    if (this._params.wasResultUrlSpecified()) {
        return this._submitUrlFromSpecifiedUrl();
    } else {
        return this._submitUrlFromTestRunnerLocation();
    }
}

JsUnitTestManager.prototype.isFileProtocol = function() {
    return this.getTestFileProtocol() == 'file:///';
}

JsUnitTestManager.prototype.getTestPageString = function() {
    var testPageParameter = this._params.getTestPage();
    var isFileProtocol = this.isFileProtocol();
    var testPageString = "";
    if (testPageParameter) {
        if (!isFileProtocol) {
            var topLocation = top.location;
            if (testPageParameter.indexOf('/') == 0)
                testPageString += topLocation.host;
            else if (testPageParameter.indexOf('./') == 0) {
                testPageString += topLocation.href.substr(0, topLocation.href.indexOf("testRunner.html"));
                testPageParameter = testPageParameter.substr(2, testPageParameter.length);
            }
        }
        testPageString += testPageParameter;
        var testParms = this._params.constructTestParams();
        if (testParms != '') {
            testPageString += '?';
            testPageString += testParms;
        }
    }
    return testPageString;
}


JsUnitTestManager.prototype.getTestFileProtocol = function() {
    var protocol = top.document.location.protocol;

    if (protocol == "file:")
        return "file:///";

    if (protocol == "http:")
        return "http://";

    if (protocol == 'https:')
        return 'https://';

    if (protocol == "chrome:")
        return "chrome://";

    return null;
}

JsUnitTestManager.prototype.browserSupportsReadingFullPathFromFileField = function() {
    return false; //pretty much all modern browsers disallow this now
}

JsUnitTestManager.prototype.isOpera = function() {
    return navigator.userAgent.toLowerCase().indexOf("opera") != -1;
}

JsUnitTestManager.prototype.isIE7 = function() {
    return navigator.userAgent.toLowerCase().indexOf("msie 7") != -1;
}

JsUnitTestManager.prototype.isFirefox3 = function() {
    return navigator.userAgent.toLowerCase().indexOf("firefox/3") != -1;
}

JsUnitTestManager.prototype.isSafari4 = function() {
    return navigator.userAgent.toLowerCase().indexOf("4.0 safari") != -1;
}

JsUnitTestManager.prototype.isBeingRunOverHTTP = function() {
    return this.getTestFileProtocol() == "http://";
}

JsUnitTestManager.prototype.getWebserver = function() {
    if (this.isBeingRunOverHTTP()) {
        var myUrl = location.href;
        var myUrlWithProtocolStripped = myUrl.substring(myUrl.indexOf("/") + 2);
        return myUrlWithProtocolStripped.substring(0, myUrlWithProtocolStripped.indexOf("/"));
    }
    return null;
}

JsUnitTestManager.prototype.addTraceData = function(message, value, traceLevel) {
    var traceMessage = new JsUnit.TraceMessage(message, value, traceLevel);
    this._currentTest.addTraceMessage(traceMessage);

    if (!this._params.shouldSubmitResults()) {
        this._uiManager.addedTraceData(this._currentTest, traceMessage);
    }
}

if (!Array.prototype.push) {
    Array.prototype.push = function (anObject) {
        this[this.length] = anObject;
    }
}

if (!Array.prototype.pop) {
    Array.prototype.pop = function () {
        if (this.length > 0) {
            delete this[this.length - 1];
            this.length--;
        }
    }
}
