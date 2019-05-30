import { Objects } from '@ephox/boulder';
import { console, window } from '@ephox/dom-globals';
import { Arr, Cell, Fun, Obj, Option, Options } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as SystemEvents from '../api/events/SystemEvents';
import * as AlloyLogger from '../log/AlloyLogger';

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

enum EventConfiguration {
  STOP,
  NORMAL,
  LOGGING
}

const eventConfig = Cell<Record<string, EventConfiguration>>({ });

export type EventProcessor = (logger: any) => boolean;

const makeEventLogger = (eventName: string, initialTarget: Element) => {
  const sequence = [ ];
  const startTime = new Date().getTime();

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
      const finishTime = new Date().getTime();
      if (Arr.contains([ 'mousemove', 'mouseover', 'mouseout', SystemEvents.systemInit() ], eventName)) { return; }
      // tslint:disable-next-line:no-console
      console.log(eventName, {
        event: eventName,
        time: finishTime - startTime,
        target: initialTarget.dom(),
        sequence: Arr.map(sequence, (s) => {
          if (! Arr.contains([ 'cut', 'stopped', 'response' ], s.outcome)) { return s.outcome; } else { return '{' + s.purpose + '} ' + s.outcome + ' at (' + AlloyLogger.element(s.target) + ')'; }
        })
      });
    }
  };
};

const processEvent = (eventName: string, initialTarget: Element, f: EventProcessor) => {
  const status = Objects.readOptFrom<EventConfiguration>(eventConfig.get(), eventName).orThunk(() => {
    const patterns = Obj.keys(eventConfig.get());
    return Options.findMap(patterns, (p) => {
      return eventName.indexOf(p) > -1 ? Option.some(eventConfig.get()[p]) : Option.none();
    });
  }).getOr(
    EventConfiguration.NORMAL
  );

  switch (status) {
    case EventConfiguration.NORMAL:
      return f(noLogger());
    case EventConfiguration.LOGGING: {
      const logger = makeEventLogger(eventName, initialTarget);
      const output = f(logger);
      logger.write();
      return output;
    }
    case EventConfiguration.STOP:
      // Does not even run the function to trigger event and listen to handlers
      return true;
  }
};

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

const monitorEvent = (eventName, initialTarget, f): boolean => {
  return processEvent(eventName, initialTarget, f);
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
  if (window[CHROME_INSPECTOR_GLOBAL] !== undefined) {
    return window[CHROME_INSPECTOR_GLOBAL];
  } else {
    const setEventStatus = (eventName: string, status: EventConfiguration) => {
      const evs = eventConfig.get();
      evs[eventName] = status;
      eventConfig.set(evs);
    };

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
        }).orThunk(() => {
          return Option.some({
            error: 'Systems (' + connections.join(', ') + ') did not contain uid: ' + uid
          });
        });
      },

      events: {
        setToNormal: (eventName: string) => {
          setEventStatus(eventName, EventConfiguration.NORMAL);
        },
        setToLogging: (eventName: string) => {
          setEventStatus(eventName, EventConfiguration.LOGGING);
        },
        setToStop: (eventName: string) => {
          setEventStatus(eventName, EventConfiguration.STOP);
        }
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
