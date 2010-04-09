Function.prototype.bind = function() {
    var __method = this, args = Array.prototype.slice.call(arguments, 1), object = arguments[0];
    return function() {
      return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
    }
}

JsUnit.ModernUiManager = function(testManager) {
    this._testManager = testManager;

    this._recentlyUpdated = [];
    this._recentlyUpdatedClearTime = 0;
}

JsUnit.Util.inherit(JsUnit.BaseUiManager, JsUnit.ModernUiManager);

JsUnit.ModernUiManager.prototype.onLoad = function(uiWindow) {
    this._uiWindow = uiWindow;
    this._uiDoc = uiWindow.document;

    this._testFileInput = this._uiDoc.getElementById("testFileInput");

    this._statusTextNode = this._findTextNode("status");
    this._runCountTextNode = this._findTextNode("runCount");
    this._errorCountTextNode = this._findTextNode("errorCount");
    this._failureCountTextNode = this._findTextNode("failureCount");
    this._elapsedTimeTextNode = this._findTextNode("elapsedTime");

    this._progressBar = this._uiDoc.getElementById("progress");

    // tests info area
    this._testsInfoDiv = this._uiDoc.getElementById("testsInfo");
    this._testsInfoCompleteDiv = this._uiDoc.getElementById("testsInfoComplete");
    this._testsInfoCurrentSuiteDiv = this._uiDoc.getElementById("testsInfoCurrentSuite");
    this._testsInfoCurrentTestTextNode = this._findTextNode("testsInfoCurrentTest");

    this._testResultTestDiv = this._uiDoc.getElementById("testResultTest");
    this._testResultDetailsDiv = this._uiDoc.getElementById("testResultDetails");

    this.showPassed(false);
}

JsUnit.ModernUiManager.prototype.getUiFrameUrl = function() {
    return './app/modernUi.html';
}

JsUnit.ModernUiManager.prototype.getTestFileName = function() {
    return this._testFileInput.value;
}

JsUnit.ModernUiManager.prototype.getTraceLevel = function() {
    return JsUnitTraceLevel.NONE;
}

JsUnit.ModernUiManager.prototype.starting = function () {
    this._testsInfoCompleteDiv.innerHTML = '';
    this._testResultDetailsDiv.innerHTML = '';
}

JsUnit.ModernUiManager.prototype.submittingResults = function () {
}

JsUnit.ModernUiManager.prototype.showMessageForSelectedProblemTest = function () {
}

JsUnit.ModernUiManager.prototype.showMessagesForAllProblemTests = function () {
}

JsUnit.ModernUiManager.prototype.showLog = function() {
}

JsUnit.ModernUiManager.prototype.fatalError = function(aMessage) {
    if (this._testManager._params.shouldSuppressDialogs()) // todo: huh?
        this.setStatus(aMessage);
    else
        alert(aMessage);
}

JsUnit.ModernUiManager.prototype.userConfirm = function(aMessage) {
    if (this._testManager._params.shouldSuppressDialogs()) // todo: huh?
        return false;
    else
        return confirm(aMessage);
}

Object.extend = function(obj, extendWith) {
    for (var name in extendWith) {
        obj[name] = extendWith[name];
    }
}

Object.extend(JsUnit.ModernUiManager.prototype, {
    _findTextNode: function(id) {
        var element = this._uiDoc.getElementById(id);
        if (element.childNodes.length == 1) {
            return element.childNodes[0];
        }
        var node = this._uiDoc.createTextNode("");
        element.appendChild(node);
        return node;
    },

    _setSpanText: function(span, text) {
        span.innerHTML = text;
    },

    _setTextNode: function(textNode, text) {
        textNode.data = text;
    },

    setStatus: function(str) {
        this._setTextNode(this._statusTextNode, str);
    },

    _addRecentlyUpdated: function(element) {
        var cssClasses = element.getAttribute("class");
        if (cssClasses.indexOf(" recentlyUpdated") > -1) return;

        element.setAttribute("class", cssClasses + " recentlyUpdated");
        this._recentlyUpdated.push(element);

        this._testsInfoDiv.scrollTop = element.offsetTop - 30;
    },

    _clearRecentlyUpdated: function(clearAll) {
        if (this._recentlyUpdated.length == 0) return;

        var time = new Date().getTime();
        if (!clearAll && time < this._recentlyUpdatedClearTime + 250) return;
        this._recentlyUpdatedClearTime = time;
        var lastToClear = this._recentlyUpdated.length;
        if (!clearAll) lastToClear--;
        for (var i = 0; i < lastToClear; i++) {
            var element = this._recentlyUpdated[i];
            var cssClasses = element.getAttribute("class").replace(" recentlyUpdated", "");
            element.setAttribute("class", cssClasses);
        }
    },

    finishing: function () {
        this._clearRecentlyUpdated(true);
        this._setTextNode(this._testsInfoCurrentTestTextNode, "");
    },

    _setProgressBarImage: function (imgName) {
        this._progressBar.src = imgName;
    },

    _setProgressBarWidth: function (w) {
        this._progressBar.width = w;
    },

    updateProgressIndicators: function (totalCount, errorCount, failureCount, progressBarProportion) {
        this._setTextNode(this._runCountTextNode, totalCount);
        this._setTextNode(this._errorCountTextNode, errorCount);
        this._setTextNode(this._failureCountTextNode,  failureCount);
        this._setProgressBarWidth(300 * progressBarProportion);

        if (errorCount > 0 || failureCount > 0)
            this._setProgressBarImage('../images/red.gif');
        else
            this._setProgressBarImage('../images/green.gif');

//        this._setTextNode(this._elapsedTimeTextNode, this.elapsedTime());
    },

    learnedOfTestPage: function(testPage) {
        testPage.headerElement = this._uiDoc.createElement("li");
        testPage.headerElement.innerHTML = testPage.url;

        testPage.testListElement = this._uiDoc.createElement("ul");

        this._testsInfoCompleteDiv.appendChild(testPage.headerElement);
        this._testsInfoCompleteDiv.appendChild(testPage.testListElement);

        this._testPageUpdate(testPage, JsUnit.TestPage.STATUS_CHANGE_EVENT);
        testPage.listen(this._testPageUpdate.bind(this));
    },

    _testPageUpdate: function(testPage, event) {
        if (event == JsUnit.TestPage.READY_EVENT) {
            for (var i = 0; i < testPage.tests.length; i++) {
                var theTest = testPage.tests[i];
                theTest.listen(this.testCompleted.bind(this));
                this._displayTestResult(theTest);
            }
        }
        testPage.headerElement.setAttribute("class", "testPage " + testPage.getStatus());
        this._addRecentlyUpdated(testPage.headerElement);
    },

    testCompleted: function(test) {
        this._updateTestResultStatus(test);
    },


    _showDetails: function(theTest) {
        var div = theTest.div;
        this._testResultTestDiv.innerHTML = theTest.testPage.url + "." + theTest.testName;
        var text;
        switch (theTest.status) {
            case 'success':
                text = "Test succeeded!";
                break;
            case 'failure':
            case 'error':
                text = theTest.message + ":\n";
                text += this.problemDetailMessageFor(theTest.exception);
                break;
            default:
                throw new Error("unknown status '" + theTest.status + "'");
        }

        var traceMessages = theTest.traceMessages;
        if (traceMessages.length > 0) {
            text += "<blockquote>";
            for (var i = 0; i < traceMessages.length; i++) {
                text += "<span style=\"color: " + traceMessages[i].traceLevel.getColor() + "\">";
                text += traceMessages[i].message;
                text += "</span>\n";
            }
            text += "</blockquote>";
        }

        text = this.makeHTMLSafe(text).split('\n').join("\n<br />\n");
        text = text.replace(/(Stack trace follows:\n)/, "$1<div class=\"stackTrace\">") + "</div>";
        this._testResultDetailsDiv.innerHTML = text;
    },

    _displayTestResult: function(theTest) {
        var timeTaken = theTest.timeTaken;

        var manager = this;
        var clicked = function() {
            manager._showDetails.call(manager, theTest);
        };

        var div = this._createItem("&nbsp;&nbsp;" + theTest.testName, theTest.status, clicked);
        theTest.div = div;
        theTest.testPage.testListElement.appendChild(div);
        this._updateTestResultStatus(theTest);

        this._testPageUpdate(theTest.testPage);
        this._clearRecentlyUpdated(false);
    },

    _updateTestResultStatus: function(theTest) {
        var element = theTest.div;
        element.setAttribute("class", "testResult " + theTest.status);
        this._addRecentlyUpdated(element);
    },

    _createItem: function(name, status, onClick) {
        var div = this._uiDoc.createElement("li");
        if (div.addEventListener) {
            div.addEventListener("click", onClick, true);
        } else if (div.attachEvent) {
            div.attachEvent('on' + "click", onClick);
        }

//        div.addNode(document.createTextNode(theTest.getFunctionName()));
        div.innerHTML = name;
        return div;
    },

    _displayTestException: function(problemValue, problemMessage) {
        var listField = this.problemsListField;
        this._addOption(listField, problemValue, problemMessage);
    },

    addedTraceData: function(theTest, traceMessage) {
    },

    showPassed: function(shouldShow) {
        this._testsInfoCompleteDiv.setAttribute("class", shouldShow ? "showPassed" : "hidePassed");
    },

    _last: null

});


