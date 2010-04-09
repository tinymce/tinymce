JsUnit.Params = function(string) {
    this.hash = new Object();

    if (!string) return;

    var i = string.indexOf('?');
    if (i != -1) {
        string = string.substring(i + 1);
    }

    var parmList = string.split('&');
    var a;
    for (j = 0; j < parmList.length; j++) {
        a = parmList[j].split('=');
        a[0] = unescape(a[0].toLowerCase());
        if (a.length > 1) {
            this.hash[a[0]] = unescape(a[1]);
        }
        else {
            this.hash[a[0]] = true;
        }
    }
}

JsUnit.Params.prototype.get = function(name) {
    if (typeof(this.hash[name]) != 'undefined') {
        return this.hash[name];
    }
    return null;
}

JsUnit.Params.prototype.getTestPage = function() {
    return this.get('testpage');
}

JsUnit.Params.prototype.shouldKickOffTestsAutomatically = function() {
    return this.get('autorun') == "true";
}

JsUnit.Params.prototype.shouldShowTestFrame = function() {
    return this.get('showtestframe');
}

JsUnit.Params.prototype.getShowTestFrameHeight = function() {
    var param = this.get('showtestframe');
    return param == "true" ? JsUnitTestManager.DEFAULT_TEST_FRAME_HEIGHT : param;
}

JsUnit.Params.prototype.shouldSuppressDialogs = function() {
    return this.shouldSubmitResults() || this.get('suppressdialogs');
}

JsUnit.Params.prototype.getPageLoadTimeout = function() {
    return this.get('pageloadtimeout') || JsUnitTestManager.TESTPAGE_WAIT_SEC;
}

JsUnit.Params.prototype.getSetupPageTimeout = function() {
    return this.get('setuppagetimeout') || JsUnitTestManager.SETUPPAGE_TIMEOUT;
}

JsUnit.Params.prototype.getResultId = function() {
    if (this.get('resultid'))
        return this.get('resultid');
    return "";
}

JsUnit.Params.prototype.getBrowserId = function() {
    if (this.get('browserid'))
        return this.get('browserid');
    return "";
}

JsUnit.Params.prototype.shouldSubmitResults = function() {
    return this.get('submitresults');
}

JsUnit.Params.prototype.getSpecifiedResultUrl = function() {
    return this.get('submitresults');
}

JsUnit.Params.prototype.wasResultUrlSpecified = function() {
    return this.shouldSubmitResults() && this.get('submitresults') != 'true';
}

JsUnit.Params.prototype.constructTestParams = function() {
    var parms = '';

    for (var p in this.hash) {
        var value = this.hash[p];

        if (!value ||
            p == 'testpage' ||
            p == 'autorun' ||
            p == 'submitresults' ||
            p == 'showtestframe' ||
            p == 'browserid' ||
            p == 'resultid') {
            continue;
        }

        if (parms) {
            parms += '&';
        }

        parms += escape(p);

        if (typeof(value) != 'boolean') {
            parms += '=' + escape(value);
        }
    }

    return parms;
}
