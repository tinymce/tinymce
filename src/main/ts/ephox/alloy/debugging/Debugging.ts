import { Objects } from '@ephox/boulder';
import { Arr, Fun, Obj, Options } from '@ephox/katamari';

import * as SystemEvents from '../api/events/SystemEvents';
import * as AlloyLogger from '../log/AlloyLogger';
import { console, window } from '@ephox/dom-globals';

const unknown = 'unknown';

/*
  typescipt qwerk:
  const debugging: boolean = true;
  if (boolean === false) {  -> this throws a type error! // TS2365:Operator '===' cannot be applied to types 'false' and 'true'
    https://www.typescriptlang.org/play/#src=const%20foo%3A%20boolean%20%3D%20true%3B%0D%0A%0D%0Aif%20(foo%20%3D%3D%3D%20false)%20%7B%0D%0A%20%20%20%20%0D%0A%7D
  }
*/
const debugging: any = true;

const CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';

const eventsMonitored: any = [ SystemEvents.execute() ];

// Ignore these files in the error stack
const path = [
  'alloy/data/Fields',
  'alloy/debugging/Debugging'
];

const getTrace = () => {
  if (debugging === false) { return unknown; }
  const err = new Error();
  if (err.stack !== undefined) {
    const lines = err.stack.split('\n');
    return Arr.find(lines, (line) => {
      return line.indexOf('alloy') > 0 && !Arr.exists(path, (p) => line.indexOf(p) > -1);
    }).getOr(unknown);
  } else {
    return unknown;
  }
};

const logHandler = (label, handlerName, trace) => {
  // if (debugging) console.log(label + ' [' + handlerName + ']', trace);
};

const ignoreEvent = {
  logEventCut: Fun.noop,
  logEventStopped: Fun.noop,
  logNoParent: Fun.noop,
  logEventNoHandlers: Fun.noop,
  logEventResponse: Fun.noop,
  write: Fun.noop
};

const monitorEvent = (eventName, initialTarget, f) => {
  const logger = debugging && (eventsMonitored === '*' || Arr.contains(eventsMonitored, eventName)) ? (() => {
    const sequence = [ ];

    return {
      logEventCut (name, target, purpose) {
        sequence.push({ outcome: 'cut', target, purpose });
      },
      logEventStopped (name, target, purpose) {
        sequence.push({ outcome: 'stopped', target, purpose });
      },
      logNoParent (name, target, purpose) {
        sequence.push({ outcome: 'no-parent', target, purpose });
      },
      logEventNoHandlers (name, target) {
        sequence.push({ outcome: 'no-handlers-left', target });
      },
      logEventResponse (name, target, purpose) {
        sequence.push({ outcome: 'response', purpose, target });
      },
      write () {
        if (Arr.contains([ 'mousemove', 'mouseover', 'mouseout', SystemEvents.systemInit() ], eventName)) { return; }
        // tslint:disable-next-line:no-console
        console.log(eventName, {
          event: eventName,
          target: initialTarget.dom(),
          sequence: Arr.map(sequence, (s) => {
            if (! Arr.contains([ 'cut', 'stopped', 'response' ], s.outcome)) { return s.outcome; } else { return '{' + s.purpose + '} ' + s.outcome + ' at (' + AlloyLogger.element(s.target) + ')'; }
          })
        });
      }
    };
  })() : ignoreEvent;

  const output = f(logger);
  logger.write();
  return output;
};

const inspectorInfo = (comp) => {
  const go = (c) => {
    const cSpec = c.spec();

    return {
      '(original.spec)': cSpec,
      '(dom.ref)': c.element().dom(),
      '(element)': AlloyLogger.element(c.element()),
      '(initComponents)': Arr.map(cSpec.components !== undefined ? cSpec.components : [ ], go),
      '(components)': Arr.map(c.components(), go),
      '(bound.events)': Obj.mapToArray(c.events(), (v, k) => {
        return [ k ];
      }).join(', '),
      '(behaviours)': cSpec.behaviours !== undefined ? Obj.map(cSpec.behaviours, (v, k) => {
        return v === undefined ? '--revoked--' : {
          'config': v.configAsRaw(),
          'original-config': v.initialConfig,
          'state': c.readState(k)
        };
      }) : 'none'
    };
  };

  return go(comp);
};

const getOrInitConnection = () => {
  // The format of the global is going to be:
  // lookup(uid) -> Option { name => data }
  // systems: Set AlloyRoots
  if (window[CHROME_INSPECTOR_GLOBAL] !== undefined) { return window[CHROME_INSPECTOR_GLOBAL]; } else {
    window[CHROME_INSPECTOR_GLOBAL] = {
      systems: { },
      lookup (uid) {
        const systems = window[CHROME_INSPECTOR_GLOBAL].systems;
        const connections: string[] = Obj.keys(systems);
        return Options.findMap(connections, (conn) => {
          const connGui = systems[conn];
          return connGui.getByUid(uid).toOption().map((comp) => {
            return Objects.wrap(AlloyLogger.element(comp.element()), inspectorInfo(comp));
          });
        });
      }
    };
    return window[CHROME_INSPECTOR_GLOBAL];
  }
};

const registerInspector = (name, gui) => {
  const connection = getOrInitConnection();
  connection.systems[name] = gui;
};

const noLogger = Fun.constant(ignoreEvent);
const isDebugging = Fun.constant(debugging);

export {
  logHandler,
  noLogger,
  getTrace,
  monitorEvent,
  isDebugging,
  registerInspector
};
