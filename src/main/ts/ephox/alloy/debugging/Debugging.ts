import SystemEvents from '../api/events/SystemEvents';
import AlloyLogger from '../log/AlloyLogger';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Options } from '@ephox/katamari';

var unknown = 'unknown';
var debugging = true;

var CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';

var eventsMonitored:any = [ ];

// Ignore these files in the error stack
var path = [
  'alloy/data/Fields',
  'alloy/debugging/Debugging'
];

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
  // if (debugging) console.log(label + ' [' + handlerName + ']', trace);
};

var ignoreEvent = {
  logEventCut: Fun.noop,
  logEventStopped: Fun.noop,
  logNoParent: Fun.noop,
  logEventNoHandlers: Fun.noop,
  logEventResponse: Fun.noop,
  write: Fun.noop
};

var monitorEvent = function (eventName, initialTarget, f) {
  var logger = debugging && (eventsMonitored === '*' || Arr.contains(eventsMonitored, eventName)) ? (function () {
    var sequence = [ ];

    return {
      logEventCut: function (name, target, purpose) {
        sequence.push({ outcome: 'cut', target: target, purpose: purpose });
      },
      logEventStopped: function (name, target, purpose) {
        sequence.push({ outcome: 'stopped', target: target, purpose: purpose });
      },
      logNoParent: function (name, target, purpose) {
        sequence.push({ outcome: 'no-parent', target: target, purpose: purpose });
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

var inspectorInfo = function (comp) {
  var go = function (c) {
    var cSpec = c.spec();

    return {
      '(original.spec)': cSpec,
      '(dom.ref)': c.element().dom(),
      '(element)': AlloyLogger.element(c.element()),
      '(initComponents)': Arr.map(cSpec.components !== undefined ? cSpec.components : [ ], go),
      '(components)': Arr.map(c.components(), go),
      '(bound.events)': Obj.mapToArray(c.events(), function (v, k) {
        return [ k ];
      }).join(', '),
      '(behaviours)': cSpec.behaviours !== undefined ? Obj.map(cSpec.behaviours, function (v, k) {
        return v === undefined ? '--revoked--' : {
          config: v.configAsRaw(),
          'original-config': v.initialConfig,
          state: c.readState(k)
        };
      }) : 'none'
    };
  };

  return go(comp);
};

var getOrInitConnection = function () {
  // The format of the global is going to be:
  // lookup(uid) -> Option { name => data }
  // systems: Set AlloyRoots
  if (window[CHROME_INSPECTOR_GLOBAL] !== undefined) return window[CHROME_INSPECTOR_GLOBAL];
  else {
    window[CHROME_INSPECTOR_GLOBAL] = {
      systems: { },
      lookup: function (uid) {
        var systems = window[CHROME_INSPECTOR_GLOBAL].systems;
        var connections: string[] = Obj.keys(systems);
        return Options.findMap(connections, function (conn) {
          var connGui = systems[conn];
          return connGui.getByUid(uid).toOption().map(function (comp) {
            return Objects.wrap(AlloyLogger.element(comp.element()), inspectorInfo(comp));
          });
        });
      }
    };
    return window[CHROME_INSPECTOR_GLOBAL];
  }
};

var registerInspector = function (name, gui) {
  var connection = getOrInitConnection();
  connection.systems[name] = gui;
};

export default <any> {
  logHandler: logHandler,
  noLogger: Fun.constant(ignoreEvent),
  getTrace: getTrace,
  monitorEvent: monitorEvent,
  isDebugging: Fun.constant(debugging),
  registerInspector: registerInspector
};