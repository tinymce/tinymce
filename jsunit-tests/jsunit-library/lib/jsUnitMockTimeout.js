/**
 * @fileoverview
 * jsUnitMockTimeout.js changes the behavior of setTimeout, clearTimeout, setInterval and clearInterval to provide a
 * powerful way of testing callbacks.  Instead of setting up timed callbacks, the callbacks and the time to their
 * execution are stored on a class called Clock.  When the Clock is told to "advance time", the appropriate callbacks
 * are executed.  In this way, real time is taken out of the picture and the test author has control.
 *
 * Contributed by Nathan Wilmes of Pivotal Labs, http://www.pivotallabs.com
 */

/**
 * @class
 * Clock stores callbacks and executes them when it is told to simulate the advancing of time
 */
function Clock() { }
/**
 * The number of timeouts executed
 */
Clock.timeoutsMade = 0;
/**
 * Hash of milliseconds to scheduled functions
 */
Clock.scheduledFunctions = {};
/**
 * The current milliseconds
 */
Clock.nowMillis = 0;

/**
 * Resets the clock - clears the scheduledFunctions, the current milliseconds, and the timeouts made count
 */
Clock.reset = function() {
    Clock.scheduledFunctions = {};
    Clock.nowMillis = 0;
    Clock.timeoutsMade = 0;
}

/**
 * Simulate the advancing of time.  Any functions scheduled in the given interval will be executed
 * @param millis the number of milliseconds by which to advance time
 */
Clock.tick = function(millis) {
    var oldMillis = Clock.nowMillis;
    var newMillis = oldMillis + millis;
    Clock._runFunctionsWithinRange(oldMillis, newMillis);
    Clock.nowMillis = newMillis;
};

/**
 * @private
 * @param oldMillis
 * @param nowMillis
 */
Clock._runFunctionsWithinRange = function(oldMillis, nowMillis) {
    var scheduledFunc;
    var funcsToRun = [];
    for (var timeoutKey in Clock.scheduledFunctions) {
        scheduledFunc = Clock.scheduledFunctions[timeoutKey];
        if (scheduledFunc != undefined &&
            scheduledFunc.runAtMillis >= oldMillis &&
            scheduledFunc.runAtMillis <= nowMillis) {
            funcsToRun.push(scheduledFunc);
            Clock.scheduledFunctions[timeoutKey] = undefined;
        }
    }

    if (funcsToRun.length > 0) {
        funcsToRun.sort(function(a, b) {
            return a.runAtMillis - b.runAtMillis;
        });
        for (var i = 0; i < funcsToRun.length; ++i) {
            try {
                Clock.nowMillis = funcsToRun[i].runAtMillis;
                funcsToRun[i].funcToCall();
                if (funcsToRun[i].recurring) {
                    Clock.scheduleFunction(funcsToRun[i].timeoutKey,
                            funcsToRun[i].funcToCall,
                            funcsToRun[i].millis,
                            true);
                }
            } catch(e) {
            }
        }
        Clock._runFunctionsWithinRange(oldMillis, nowMillis);
    }
}

/**
 * Schedules a function to be executed at the given number of milliseconds from now
 * @param timeoutKey - the ID of the callback
 * @param funcToCall - the function to call
 * @param millis - the number of milliseconds before the callback
 * @param recurring - whether the callback recurs - if true, then the callback will be re-registered after it executes
 */
Clock.scheduleFunction = function(timeoutKey, funcToCall, millis, recurring) {
    Clock.scheduledFunctions[timeoutKey] = {
        runAtMillis: Clock.nowMillis + millis,
        funcToCall: funcToCall,
        recurring: recurring,
        timeoutKey: timeoutKey,
        millis: millis
    };
};

/**
 * Mocks out setTimeout by registering the callback with Clock
 * @param funcToCall
 * @param millis
 * @return the ID of the timeout, which is the index of the scheduledFunction in Clock's list of scheduledFunctions
 */
function setTimeout(funcToCall, millis) {
    Clock.timeoutsMade = Clock.timeoutsMade + 1;
    Clock.scheduleFunction(Clock.timeoutsMade, funcToCall, millis, false);
    return Clock.timeoutsMade;
}

/**
 * Mocks out setInterval by registering the callback with Clock
 * @param funcToCall
 * @param millis
 * @return the ID of the timeout, which is the index of the scheduledFunction in Clock's list of scheduledFunctions
 */
function setInterval(funcToCall, millis) {
    Clock.timeoutsMade = Clock.timeoutsMade + 1;
    Clock.scheduleFunction(Clock.timeoutsMade, funcToCall, millis, true);
    return Clock.timeoutsMade;
}

/**
 * Mocks out clearTimeout by clearing Clock's scheduledFunction for the given ID
 */
function clearTimeout(timeoutKey) {
    Clock.scheduledFunctions[timeoutKey] = undefined;
}

/**
 * Mocks out clearInterval by clearing Clock's scheduledFunction for the given ID
 */
function clearInterval(timeoutKey) {
    Clock.scheduledFunctions[timeoutKey] = undefined;
}
