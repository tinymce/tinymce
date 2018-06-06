import { Objects } from '@ephox/boulder';

import * as EventRoot from '../../alien/EventRoot';
import * as EventHandler from '../../construct/EventHandler';
import * as AlloyTriggers from './AlloyTriggers';
import * as SystemEvents from './SystemEvents';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimulatedEvent } from '../../events/SimulatedEvent';
import { SpecSchemaStruct } from '../../spec/SpecSchema';

// TODO: Fix types.
export type EventHandlerConfigRecord = Record<string, AlloyEventHandler>;

export interface AlloyEventHandler {
  can: () => boolean;
  abort: () => boolean;
  run: EventRunHandler;
}

export interface EventHandlerConfig {
  key: string;
  value: AlloyEventHandler;
}

// TODO we can tighten this up alot further, it should take a simulatedEvent, however SimulatedEvent.event() can return 2 types, need to solve that issue first (SugarEvent or SimulatedEventTargets)
// export type EventRunHandler = (component: AlloyComponent, action: SimulatedEvent) => any;
type RunOnName = (handler: EventRunHandler) => EventHandlerConfig;
type RunOnSourceName = (handler: EventRunHandler) => EventHandlerConfig;
export type EventRunHandler = (component: AlloyComponent, action: { [eventName: string]: any }) => any;

const derive = (configs: EventHandlerConfig[]): EventHandlerConfigRecord => {
  return Objects.wrapAll(configs) as EventHandlerConfigRecord;
};

// const combine = (configs...);

const abort = function (name, predicate): EventHandlerConfig {
  return {
    key: name,
    value: EventHandler.nu({
      abort: predicate
    })
  };
};

const can = function (name, predicate): EventHandlerConfig {
  return {
    key: name,
    value: EventHandler.nu({
      can: predicate
    })
  };
};

const preventDefault = function (name: string): EventHandlerConfig {
  return {
    key: name,
    value: EventHandler.nu({
      run (component, simulatedEvent) {
        simulatedEvent.event().prevent();
      }
    })
  };
};

const run = function (name: string, handler: EventRunHandler): EventHandlerConfig {
  return {
    key: name,
    value: EventHandler.nu({
      run: handler
    })
  };
};

const runActionExtra = function (name: string, action: (t: any, u: any) => void, extra: SpecSchemaStruct[]): EventHandlerConfig {
  return {
    key: name,
    value: EventHandler.nu({
      run (component) {
        action.apply(undefined, [ component ].concat(extra));
      }
    })
  };
};

const runOnName = function (name): RunOnName {
  return function (handler) {
    return run(name, handler);
  };
};

const runOnSourceName = function (name): RunOnSourceName {
  return function (handler) {
    return {
      key: name,
      value: EventHandler.nu({
        run (component, simulatedEvent) {
          if (EventRoot.isSource(component, simulatedEvent)) { handler(component, simulatedEvent); }
        }
      })
    };
  };
};

const redirectToUid = function (name, uid): EventHandlerConfig {
  return run(name, function (component: AlloyComponent, simulatedEvent: SimulatedEvent) {
    component.getSystem().getByUid(uid).each(function (redirectee) {
      AlloyTriggers.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
    });
  });
};

const redirectToPart = function (name, detail, partName): EventHandlerConfig {
  const uid = detail.partUids()[partName];
  return redirectToUid(name, uid);
};

const runWithTarget = function (name, f): EventHandlerConfig {
  return run(name, function (component, simulatedEvent) {
    component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
      f(component, target, simulatedEvent);
    });
  });
};

const cutter = function (name): EventHandlerConfig {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.cut();
  });
};

const stopper = function (name): EventHandlerConfig {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.stop();
  });
};

const runOnAttached = runOnSourceName(SystemEvents.attachedToDom()) as RunOnSourceName;
const runOnDetached = runOnSourceName(SystemEvents.detachedFromDom()) as RunOnSourceName;
const runOnInit = runOnSourceName(SystemEvents.systemInit()) as RunOnSourceName;
const runOnExecute = runOnName(SystemEvents.execute()) as RunOnName;

export {
  derive,
  run,
  preventDefault,
  runActionExtra,
  runOnAttached,
  runOnDetached,
  runOnInit,
  runOnExecute,

  redirectToUid,
  redirectToPart,
  runWithTarget,
  abort,
  can,
  cutter,
  stopper
};