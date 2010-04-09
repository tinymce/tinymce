function JsUnitTraceLevel(levelNumber, color) {
    this._levelNumber = levelNumber;
    this._color = color;
}

JsUnitTraceLevel.prototype.matches = function(otherTraceLevel) {
    return this._levelNumber >= otherTraceLevel._levelNumber;
}

JsUnitTraceLevel.prototype.getColor = function() {
    return this._color;
}

JsUnitTraceLevel.findByLevelNumber = function(levelNumber) {
    switch (levelNumber) {
        case 0: return JsUnitTraceLevel.NONE;
        case 1: return JsUnitTraceLevel.WARNING;
        case 2: return JsUnitTraceLevel.INFO;
        case 3: return JsUnitTraceLevel.DEBUG;
    }
    return null;
}

JsUnitTraceLevel.NONE = new JsUnitTraceLevel(0, null);
JsUnitTraceLevel.WARNING = new JsUnitTraceLevel(1, "#FF0000");
JsUnitTraceLevel.INFO = new JsUnitTraceLevel(2, "#009966");
JsUnitTraceLevel.DEBUG = new JsUnitTraceLevel(3, "#0000FF");

function JsUnitTracer(testManager, params) {
    this._testManager = testManager;
    this._params = params;
}

JsUnitTracer.prototype.warn = function() {
    this._trace(arguments[0], arguments[1], JsUnitTraceLevel.WARNING);
}

JsUnitTracer.prototype.inform = function() {
    this._trace(arguments[0], arguments[1], JsUnitTraceLevel.INFO);
}

JsUnitTracer.prototype.debug = function() {
    this._trace(arguments[0], arguments[1], JsUnitTraceLevel.DEBUG);
}

JsUnitTracer.prototype._trace = function(message, value, traceLevel) {
    this._testManager.addTraceData(message, value, traceLevel);
}