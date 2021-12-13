import { Objects } from '@ephox/boulder';
import { Arr, Cell, Fun, Global, Obj, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as SystemEvents from '../api/events/SystemEvents';
import { GuiSystem } from '../api/system/Gui';
import * as AlloyLogger from '../log/AlloyLogger';

export interface DebuggerLogger {
  logEventCut: (eventName: string, target: SugarElement<Node>, purpose: string) => void;
  logEventStopped: (eventName: string, target: SugarElement<Node>, purpose: string) => void;
  logNoParent: (eventName: string, target: SugarElement<Node>, purpose: string) => void;
  logEventNoHandlers: (eventName: string, target: SugarElement<Node>) => void;
  logEventResponse: (eventName: string, target: SugarElement<Node>, purpose: string) => void;
  write: () => void;
}

export interface InspectorInfo {
  '(original.spec)': any;
  '(dom.ref)': Node;
  '(element)': string;
  '(initComponents)': InspectorInfo[];
  '(components)': InspectorInfo[];
  '(bound.events)': string;
  '(behaviours)': string | Record<string, any>;
}

type LookupInfo = { [key: string]: InspectorInfo } | { error: string };

export interface Inspector {
  systems: Record<string, GuiSystem>;
  lookup: (uid: string) => Optional<LookupInfo>;
  events: {
    setToNormal: (eventName: string) => void;
    setToLogging: (eventName: string) => void;
    setToStop: (eventName: string) => void;
  };
}

interface AlloyGlobal {
  __CHROME_INSPECTOR_CONNECTION_TO_ALLOY__: Inspector;
}

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

export type EventProcessor = (logger: DebuggerLogger) => boolean;

const makeEventLogger = (eventName: string, initialTarget: SugarElement<Node>): DebuggerLogger => {
  const sequence: Array<{ outcome: string; target: SugarElement<Node>; purpose?: string }> = [ ];
  const startTime = new Date().getTime();

  return {
    logEventCut: (_name: string, target: SugarElement<Node>, purpose: string) => {
      sequence.push({ outcome: 'cut', target, purpose });
    },
    logEventStopped: (_name: string, target: SugarElement<Node>, purpose: string) => {
      sequence.push({ outcome: 'stopped', target, purpose });
    },
    logNoParent: (_name: string, target: SugarElement<Node>, purpose: string) => {
      sequence.push({ outcome: 'no-parent', target, purpose });
    },
    logEventNoHandlers: (_name: string, target: SugarElement<Node>) => {
      sequence.push({ outcome: 'no-handlers-left', target });
    },
    logEventResponse: (_name: string, target: SugarElement<Node>, purpose: string) => {
      sequence.push({ outcome: 'response', purpose, target });
    },
    write: () => {
      const finishTime = new Date().getTime();
      if (Arr.contains([ 'mousemove', 'mouseover', 'mouseout', SystemEvents.systemInit() ], eventName)) {
        return;
      }
      // eslint-disable-next-line no-console
      console.log(eventName, {
        event: eventName,
        time: finishTime - startTime,
        target: initialTarget.dom,
        sequence: Arr.map(sequence, (s) => {
          if (!Arr.contains([ 'cut', 'stopped', 'response' ], s.outcome)) {
            return s.outcome;
          } else {
            return '{' + s.purpose + '} ' + s.outcome + ' at (' + AlloyLogger.element(s.target) + ')';
          }
        })
      });
    }
  };
};

const processEvent = (eventName: string, initialTarget: SugarElement<Node>, f: EventProcessor) => {
  const status = Obj.get(eventConfig.get(), eventName).orThunk(() => {
    const patterns = Obj.keys(eventConfig.get());
    return Arr.findMap(patterns, (p) => eventName.indexOf(p) > -1 ? Optional.some(eventConfig.get()[p]) : Optional.none());
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

const getTrace = (): string => {
  if (debugging === false) {
    return unknown;
  }
  const err = new Error();
  if (err.stack !== undefined) {
    const lines = err.stack.split('\n');
    return Arr.find(lines, (line) => line.indexOf('alloy') > 0 && !Arr.exists(path, (p) => line.indexOf(p) > -1)).getOr(unknown);
  } else {
    return unknown;
  }
};

const logHandler = (_label: string, _handlerName: string, _trace: any): void => {
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

const monitorEvent = (eventName: string, initialTarget: SugarElement<Node>, f: EventProcessor): boolean =>
  processEvent(eventName, initialTarget, f);

const inspectorInfo = (comp: AlloyComponent) => {
  const go = (c: AlloyComponent): InspectorInfo => {
    const cSpec = c.spec;

    return {
      '(original.spec)': cSpec,
      '(dom.ref)': c.element.dom,
      '(element)': AlloyLogger.element(c.element),
      '(initComponents)': Arr.map(cSpec.components !== undefined ? cSpec.components : [ ], go),
      '(components)': Arr.map(c.components(), go),
      '(bound.events)': Obj.mapToArray(c.events, (_v, k) => [ k ]).join(', '),
      '(behaviours)': cSpec.behaviours !== undefined ? Obj.map(cSpec.behaviours, (v, k) => v === undefined ? '--revoked--' : {
        'config': v.configAsRaw(),
        'original-config': v.initialConfig,
        'state': c.readState(k)
      }) : 'none'
    };
  };

  return go(comp);
};

const getOrInitConnection = (): Inspector => {
  const win: AlloyGlobal = Global;
  // The format of the global is going to be:
  // lookup(uid) -> Optional { name => data }
  // systems: Set AlloyRoots
  if (win[CHROME_INSPECTOR_GLOBAL] !== undefined) {
    return win[CHROME_INSPECTOR_GLOBAL];
  } else {
    const setEventStatus = (eventName: string, status: EventConfiguration) => {
      const evs = eventConfig.get();
      evs[eventName] = status;
      eventConfig.set(evs);
    };

    win[CHROME_INSPECTOR_GLOBAL] = {
      systems: { },
      lookup: (uid: string) => {
        const systems = win[CHROME_INSPECTOR_GLOBAL].systems;
        const connections: string[] = Obj.keys(systems);
        return Arr.findMap(connections, (conn) => {
          const connGui = systems[conn];
          return connGui.getByUid(uid).toOptional().map((comp): LookupInfo => Objects.wrap(AlloyLogger.element(comp.element), inspectorInfo(comp)));
        }).orThunk(() => Optional.some<LookupInfo>({
          error: 'Systems (' + connections.join(', ') + ') did not contain uid: ' + uid
        }));
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
    return win[CHROME_INSPECTOR_GLOBAL];
  }
};

const registerInspector = (name: string, gui: GuiSystem): void => {
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
