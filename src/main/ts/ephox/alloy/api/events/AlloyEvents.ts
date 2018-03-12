import { Objects } from '@ephox/boulder';

import * as EventRoot from '../../alien/EventRoot';
import * as EventHandler from '../../construct/EventHandler';
import * as AlloyTriggers from './AlloyTriggers';
import * as SystemEvents from './SystemEvents';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';
import { SpecSchemaStruct } from 'ephox/alloy/spec/SpecSchema';

export interface EventHandlerConfig {
  key: string;
  value: {
    can: () => boolean;
    abort: () => boolean;
    run: EventRunHandler
  };
}

// TODO we can tighten this up alot further, it should take a simulatedEvent, however SimulatedEvent.event() can return 2 types, need to solve that issue first (SugarEvent or SimulatedEventTargets)
// export type EventRunHandler = (component: AlloyComponent, action: SimulatedEvent) => any;
export type EventRunHandler = (component: AlloyComponent, action: { [eventName: string]: any }) => any;
export type RunOnSourceName = (handler: EventRunHandler) => EventHandlerConfig;

const derive = Objects.wrapAll;

const abort = function (name, predicate) {
  return {
    key: name,
    value: EventHandler.nu({
      abort: predicate
    })
  };
};

const can = function (name, predicate) {
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

const runOnName = function (name) {
  return function (handler) {
    return run(name, handler);
  };
};

const runOnSourceName = function (name) {
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

const redirectToUid = function (name, uid) {
  return run(name, function (component: AlloyComponent, simulatedEvent: SimulatedEvent) {
    component.getSystem().getByUid(uid).each(function (redirectee) {
      AlloyTriggers.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
    });
  });
};

const redirectToPart = function (name, detail, partName) {
  const uid = detail.partUids()[partName];
  return redirectToUid(name, uid);
};

const runWithTarget = function (name, f) {
  return run(name, function (component, simulatedEvent) {
    component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
      f(component, target, simulatedEvent);
    });
  });
};

const cutter = function (name) {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.cut();
  });
};

const stopper = function (name) {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.stop();
  });
};

const runOnAttached = runOnSourceName(SystemEvents.attachedToDom()) as RunOnSourceName;
const runOnDetached = runOnSourceName(SystemEvents.detachedFromDom()) as RunOnSourceName;
const runOnInit = runOnSourceName(SystemEvents.systemInit()) as RunOnSourceName;
const runOnExecute = runOnName(SystemEvents.execute()) as RunOnSourceName;

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