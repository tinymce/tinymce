define(
  'ephox.alloy.debugging.Debugging',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'global!console',
    'global!Error'
  ],

  function (SystemEvents, AlloyLogger, Arr, Fun, console, Error) {
    var unknown = 'unknown';
    var debugging = true;

    // Ignore these files in the error stack
    var path = [
      'alloy/data/Fields',
      'alloy/debugging/Debugging'
    ]

    var getTrace = function () {
      if (debugging === false) return unknown;
      var err = new Error();
      if (err.stack !== undefined) {
        var lines = err.stack.split('\n');
        return Arr.find(lines, function (line) {
          return line.indexOf('alloy') > 0 && !Arr.exists(path, function (p) { return line.indexOf(p) > -1; });
        }).getOr(unknown);
      } else {
        return unknown;
      }
    };

    var logHandler = function (label, handlerName, trace) {
      if (debugging) console.log(label + ' [' + handlerName + ']', trace);
    };

    var ignoreEvent = {
      logEventCut: Fun.noop,
      logEventStopped: Fun.noop,
      logNoParent: Fun.noop,
      logEventNoHandlers: Fun.noop,
      logEventResponse: Fun.noop,
      write: Fun.noop
    }

    var monitorEvent = function (eventName, initialTarget, f) {
      var logger = debugging && eventName === 'keydown' ? (function () {
        var sequence = [ ];
        
        return {
          logEventCut: function (name, target) {
            sequence.push({ outcome: 'cut', target: target });
          },
          logEventStopped: function (name, target) {
            sequence.push({ outcome: 'stopped', target: target });
          },
          logNoParent: function (name, target) {
            sequence.push({ outcome: 'no-parent', target: target });
          },
          logEventNoHandlers: function (name, target) {
            sequence.push({ outcome: 'no-handlers-left', target: target });
          },
          logEventResponse: function (name, target, purpose) {
            sequence.push({ outcome: 'response', purpose: purpose, target: target });
          },
          write: function () {
            if (Arr.contains([ 'mousemove', 'mouseover', 'mouseout', SystemEvents.systemInit() ], eventName)) return;
            console.log(eventName, {
              event: eventName,
              target: initialTarget.dom(),
              sequence: Arr.map(sequence, function (s) {
                if (! Arr.contains([ 'cut', 'stopped', 'response' ], s.outcome)) return s.outcome;
                else return '{' + s.purpose + '} ' + s.outcome + ' at (' + AlloyLogger.element(s.target) + ')';
              })
            });
          }
        };
      })() : ignoreEvent;

      var output = f(logger);
      logger.write();
      return output;
    };

    return {
      logHandler: logHandler,
      getTrace: getTrace,
      monitorEvent: monitorEvent,
      isDebugging: Fun.constant(debugging)
    };
  }
);
