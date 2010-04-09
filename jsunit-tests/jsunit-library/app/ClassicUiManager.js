JsUnit.ClassicUiManager = function(testManager) {
    this._testManager = testManager;
}

JsUnit.Util.inherit(JsUnit.BaseUiManager, JsUnit.ClassicUiManager);

JsUnit.ClassicUiManager.prototype.onLoad = function(mainFrame) {
    var mainData = mainFrame.frames.mainData;

    // form elements on mainData frame
    this.testFileName = mainData.document.testRunnerForm.testFileName;
    this.runButton = mainData.document.testRunnerForm.runButton;
    this.stopButton = mainData.document.testRunnerForm.stopButton;
    this.traceLevel = mainData.document.testRunnerForm.traceLevel;
    this.closeTraceWindowOnNewRun = mainData.document.testRunnerForm.closeTraceWindowOnNewRun;
    this.timeout = mainData.document.testRunnerForm.timeout;
    this.setUpPageTimeout = mainData.document.testRunnerForm.setUpPageTimeout;

    // image output
    this.progressBar = mainFrame.frames.mainProgress.document.progress;

    this.problemsListField = mainFrame.frames.mainErrors.document.testRunnerForm.problemsList;

    // 'layer' output frames
    this.uiFrames = new Object();
    this.uiFrames.mainStatus = mainFrame.frames.mainStatus;

    var mainCounts = mainFrame.frames.mainCounts;

    this.uiFrames.mainCountsErrors = mainCounts.frames.mainCountsErrors;
    this.uiFrames.mainCountsFailures = mainCounts.frames.mainCountsFailures;
    this.uiFrames.mainCountsRuns = mainCounts.frames.mainCountsRuns;

    this._windowForAllProblemMessages = null;

    this._traceWindow = null;
    this.popupWindowsBlocked = false;
}

JsUnit.ClassicUiManager.prototype.getUiFrameUrl = function() {
    return './app/main-frame.html';
}

JsUnit.ClassicUiManager.prototype.getTestFileName = function() {
    return this.testFileName.value;
}

JsUnit.ClassicUiManager.prototype.getTraceLevel = function() {
    var levelNumber = eval(this.traceLevel.value);
    return JsUnitTraceLevel.findByLevelNumber(levelNumber);
}

JsUnit.ClassicUiManager.prototype.starting = function () {
    this._setRunButtonEnabled(false);
    this._clearProblemsList();

    this.initializeTracer();

    var traceLevel = this.getTraceLevel();
    if (traceLevel != JsUnitTraceLevel.NONE) {
        this.openTracer();
    }
}

JsUnit.ClassicUiManager.prototype.finishing = function () {
    this._setRunButtonEnabled(true);

    this.finalizeTracer();
}

JsUnit.ClassicUiManager.prototype.submittingResults = function () {
    this.runButton.disabled = true;
    this.stopButton.disabled = true;
}

JsUnit.ClassicUiManager.prototype.initializeTracer = function() {
    if (this._traceWindow != null && this.closeTraceWindowOnNewRun.checked)
        this._traceWindow.close();
    this._traceWindow = null;
}

JsUnit.ClassicUiManager.prototype.finalizeTracer = function() {
    if (this._traceWindow != null) {
        this._traceWindow.document.write('<\/body>\n<\/html>');
        this._traceWindow.document.close();
    }
}

JsUnit.ClassicUiManager.prototype.openTracer = function() {
    var traceWindow = this._getTraceWindow();
    if (traceWindow) {
        traceWindow.focus();
    }
    else {
        this.fatalError('Tracing requires popup windows, and popups are blocked in your browser.\n\nPlease enable popups if you wish to use tracing.');
    }
}

JsUnit.ClassicUiManager.prototype._clearProblemsList = function () {
    var listField = this.problemsListField;
    var initialLength = listField.options.length;

    for (var i = 0; i < initialLength; i++)
        listField.remove(0);
}

JsUnit.ClassicUiManager.prototype._setRunButtonEnabled = function (b) {
    this.runButton.disabled = !b;
    this.stopButton.disabled = b;
}

JsUnit.ClassicUiManager.prototype._setTextOnLayer = function (layerName, str) {
    try {
        var content;
        if (content = this.uiFrames[layerName].document.getElementById('content'))
            content.innerHTML = str;
        else
            throw new Error("No content div found.");
    }
    catch (e) {
        var html = '';
        html += '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
        html += '<html><head><link rel="stylesheet" type="text/css" href="css/jsUnitStyle.css"><\/head>';
        html += '<body><div id="content">';
        html += str;
        html += '<\/div><\/body>';
        html += '<\/html>';
        this.uiFrames[layerName].document.write(html);
        this.uiFrames[layerName].document.close();
    }
}

JsUnit.ClassicUiManager.prototype.setStatus = function (str) {
    this._setTextOnLayer('mainStatus', '<b>Status:<\/b> ' + str);
}

JsUnit.ClassicUiManager.prototype._setErrors = function (n) {
    this._setTextOnLayer('mainCountsErrors', '<b>Errors: <\/b>' + n);
}

JsUnit.ClassicUiManager.prototype._setFailures = function (n) {
    this._setTextOnLayer('mainCountsFailures', '<b>Failures:<\/b> ' + n);
}

JsUnit.ClassicUiManager.prototype._setTotal = function (n) {
    this._setTextOnLayer('mainCountsRuns', '<b>Runs:<\/b> ' + n);
}

JsUnit.ClassicUiManager.prototype._setProgressBarImage = function (imgName) {
    this.progressBar.src = imgName;
}

JsUnit.ClassicUiManager.prototype._setProgressBarWidth = function (w) {
    this.progressBar.width = w;
}

JsUnit.ClassicUiManager.prototype.updateProgressIndicators = function (totalCount, errorCount, failureCount, progressBarProportion) {
    this._setTotal(totalCount);
    this._setErrors(errorCount);
    this._setFailures(failureCount);
    this._setProgressBarWidth(300 * progressBarProportion);

    if (errorCount > 0 || failureCount > 0)
        this._setProgressBarImage('../images/red.gif');
    else
        this._setProgressBarImage('../images/green.gif');
}

JsUnit.ClassicUiManager.prototype.testCompleted = function (test) {
    if (test.status != 'success') {
        var listField = this.problemsListField;
        var exceptionText = this.problemDetailMessageFor(test.exception);
        this._testManager._addOption(listField, exceptionText, test.message);
    }
}

JsUnit.ClassicUiManager.prototype.showMessageForSelectedProblemTest = function () {
    var problemTestIndex = this.problemsListField.selectedIndex;
    if (problemTestIndex != -1)
        this.fatalError(this.problemsListField[problemTestIndex].value);
}

JsUnit.ClassicUiManager.prototype.showMessagesForAllProblemTests = function () {
    if (this.problemsListField.length == 0)
        return;

    this._tryToCloseWindow(this._windowForAllProblemMessages);

    var body = '<p>Tests with problems (' + this.problemsListField.length + ' total) - JsUnit<\/p>'
        + '<p>Running on ' + navigator.userAgent + '</p>';

    for (var i = 0; i < this.problemsListField.length; i++) {
        body += '<p class="jsUnitDefault">';
        body += '<b>' + (i + 1) + '. ';
        body += this.problemsListField[i].text;
        body += '<\/b><\/p><p><pre>';
        body += this.makeHTMLSafe(this.problemsListField[i].value);
        body += '<\/pre><\/p>';
    }

    this._windowForAllProblemMessages = this._createWindow("Tests with problems", body);
}

JsUnit.ClassicUiManager.prototype.showLog = function() {
    this._tryToCloseWindow(this.logWindow);

    var body = "<pre>";

    var log = this._testManager.log;
    for (var i = 0; i < log.length; i++) {
        body += log[i];
        body += "\n";
    }

    body += "</pre>";

    this.logWindow = this._createWindow("Log", body);
}

JsUnit.ClassicUiManager.prototype._tryToCloseWindow = function(w) {
    try {
        if (w && !w.closed) w.close();
    } catch(e) {
    }
}

JsUnit.ClassicUiManager.prototype._createWindow = function(title, body) {
    var w = window.open('', '', 'width=600, height=350,status=no,resizable=yes,scrollbars=yes');
    var resDoc = w.document;
    resDoc.write('<html><head><link rel="stylesheet" href="../css/jsUnitStyle.css"><title>');
    resDoc.write(title);
    resDoc.write(' - JsUnit<\/title><head><body>');
    resDoc.write(body);
    resDoc.write('<\/body><\/html>');
    resDoc.close();
}


JsUnit.ClassicUiManager.prototype.fatalError = function(aMessage) {
    if (this._testManager._params.shouldSuppressDialogs()) // todo: huh?
        this.setStatus(aMessage);
    else
        alert(aMessage);
}

JsUnit.ClassicUiManager.prototype.userConfirm = function(aMessage) {
    if (this._testManager._params.shouldSuppressDialogs()) // todo: huh?
        return false;
    else
        return confirm(aMessage);
}

JsUnit.ClassicUiManager.prototype.addedTraceData = function(theTest, traceMessage) {
    if (this.getTraceLevel().matches(traceMessage.traceLevel)) {
        var traceString = traceMessage.message;
        if (traceMessage.value)
            traceString += ': ' + traceMessage.value;
        var prefix = theTest.testPage.url + ":" + theTest.testName + " - ";
        this._writeToTraceWindow(prefix, traceString, traceMessage.traceLevel);
    }
}

JsUnit.ClassicUiManager.prototype._writeToTraceWindow = function(prefix, traceString, traceLevel) {
    var htmlToAppend = '<p class="jsUnitDefault">' + prefix + '<font color="' + traceLevel.getColor() + '">' + traceString + '</font><\/p>\n';
    this._getTraceWindow().document.write(htmlToAppend);
}

JsUnit.ClassicUiManager.prototype._getTraceWindow = function() {
    if (this._traceWindow == null && !this._testManager._params.shouldSubmitResults() && !this.popupWindowsBlocked) {
        this._traceWindow = window.open('', '', 'width=600, height=350,status=no,resizable=yes,scrollbars=yes');
        if (!this._traceWindow)
            this.popupWindowsBlocked = true;
        else {
            var resDoc = this._traceWindow.document;
            resDoc.write('<html>\n<head>\n<link rel="stylesheet" href="css/jsUnitStyle.css">\n<title>Tracing - JsUnit<\/title>\n<head>\n<body>');
            resDoc.write('<h2>Tracing - JsUnit<\/h2>\n');
            resDoc.write('<p class="jsUnitDefault"><i>(Traces are color coded: ');
            resDoc.write('<font color="' + JsUnitTraceLevel.WARNING.getColor() + '">Warning</font> - ');
            resDoc.write('<font color="' + JsUnitTraceLevel.INFO.getColor() + '">Information</font> - ');
            resDoc.write('<font color="' + JsUnitTraceLevel.DEBUG.getColor() + '">Debug</font>');
            resDoc.write(')</i></p>');
        }
    }
    return this._traceWindow;
}

JsUnit.ClassicUiManager.prototype.learnedOfTestPage = function() {
}
