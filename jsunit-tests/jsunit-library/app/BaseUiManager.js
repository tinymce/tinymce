JsUnit.BaseUiManager = function() {
}

JsUnit.BaseUiManager.prototype.makeHTMLSafe = function (string) {
    string = string.replace(/&/g, '&amp;');
    string = string.replace(/</g, '&lt;');
    string = string.replace(/>/g, '&gt;');
    return string;
}

JsUnit.BaseUiManager.prototype.problemDetailMessageFor = function (excep) {
    if (excep.isJsUnitFailure) {
        var result = '';
        if (excep.comment != null)
            result += ('"' + excep.comment + '"\n');

        result += excep.jsUnitMessage;

        if (excep.stackTrace)
            result += '\n\nStack trace follows:\n' + excep.stackTrace;
        return result;
    }
    else {
        var result = 'Error message is:\n"';
        result +=
            (typeof(excep.description) == 'undefined') ?
                excep :
                excep.description;
        result += '"';

        if (typeof(excep.stack) != 'undefined') // Mozilla only
            result += '\n\nStack trace follows:\n' + excep.stack;
        return result;
    }
}

