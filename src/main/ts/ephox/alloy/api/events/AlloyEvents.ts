import { Objects } from '@ephox/boulder';

import * as EventRoot from '../../alien/EventRoot';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as EventHandler from '../../construct/EventHandler';
import { EventFormat, SimulatedEvent } from '../../events/SimulatedEvent';
import * as AlloyTriggers from './AlloyTriggers';
import * as SystemEvents from './SystemEvents';

// TODO: Fix types.
export type EventHandlerConfigRecord = Record<string, AlloyEventHandler<EventFormat>>;

export interface AlloyEventHandler<T extends EventFormat> {
  can: () => boolean;
  abort: () => boolean;
  run: EventRunHandler<T>;
}

export interface EventHandlerConfig<T> {
  key: string;
  value: AlloyEventHandler<EventFormat>;
}

// TODO we can tighten this up alot further, it should take a simulatedEvent, however SimulatedEvent.event() can return 2 types, need to solve that issue first (SugarEvent or SimulatedEventTargets)
// export type EventRunHandler = (component: AlloyComponent, action: SimulatedEvent) => any;
type RunOnName<T extends EventFormat> = (handler: EventRunHandler<T>) => EventHandlerConfig<T>;
type RunOnSourceName<T extends EventFormat> = (handler: EventRunHandler<T>) => EventHandlerConfig<T>;
export type EventRunHandler<T extends EventFormat> = (component: AlloyComponent, se: SimulatedEvent<T>, ...others) => void;

const derive = (configs: Array<EventHandlerConfig<any>>): EventHandlerConfigRecord => {
  return Objects.wrapAll(configs) as EventHandlerConfigRecord;
};

// const combine = (configs...);

const abort = function <T>(name, predicate): EventHandlerConfig<T> {
  return {
    key: name,
    value: EventHandler.nu({
      abort: predicate
    })
  };
};

const can = function <T>(name, predicate): EventHandlerConfig<T> {
  return {
    key: name,
    value: EventHandler.nu({
      can: predicate
    })
  };
};

const preventDefault = function <T>(name: string): EventHandlerConfig<T> {
  return {
    key: name,
    value: EventHandler.nu({
      run (component, simulatedEvent) {
        simulatedEvent.event().prevent();
      }
    })
  };
};

const run = function <T extends EventFormat>(name: string, handler: EventRunHandler<T>): EventHandlerConfig<T> {
  return {
    key: name,
    value: EventHandler.nu({
      run: handler
    })
  };
};

// FIX: What is the extra here?
const runActionExtra = function <T>(name: string, action: (t: AlloyComponent, u: any) => void, extra: any): EventHandlerConfig<T> {
  return {
    key: name,
    value: EventHandler.nu({
      run (component) {
        action.apply(undefined, [ component ].concat(extra));
      }
    })
  };
};

const runOnName = function <T extends EventFormat>(name): RunOnName<T> {
  return (handler) => {
    return run(name, handler);
  };
};

const runOnSourceName = function <T extends EventFormat>(name): RunOnSourceName<T> {
  return (handler: (component: AlloyComponent, simulatedEvent: SimulatedEvent<T>) => void): EventHandlerConfig<T> => {
    return {
      key: name,
      value: EventHandler.nu({
        run (component, simulatedEvent: SimulatedEvent<T>) {
          if (EventRoot.isSource(component, simulatedEvent)) { handler(component, simulatedEvent); }
        }
      })
    };
  };
};

const redirectToUid = function <T extends EventFormat>(name, uid): EventHandlerConfig<T> {
  return run(name, (component: AlloyComponent, simulatedEvent: SimulatedEvent<T>) => {
    component.getSystem().getByUid(uid).each((redirectee) => {
      AlloyTriggers.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
    });
  });
};

const redirectToPart = function <T>(name, detail, partName): EventHandlerConfig<T> {
  const uid = detail.partUids()[partName];
  return redirectToUid(name, uid);
};

const runWithTarget = function <T extends EventFormat>(name, f): EventHandlerConfig<T> {
  return run(name, (component, simulatedEvent) => {
    const ev: T = simulatedEvent.event();
    component.getSystem().getByDom(ev.target()).each((target) => {
      f(component, target, simulatedEvent);
    });
  });
};

const cutter = function <T>(name): EventHandlerConfig<T> {
  return run(name, (component, simulatedEvent) => {
    simulatedEvent.cut();
  });
};

const stopper = function <T>(name): EventHandlerConfig<T> {
  return run(name, (component, simulatedEvent) => {
    simulatedEvent.stop();
  });
};

const runOnAttached = runOnSourceName(SystemEvents.attachedToDom());
const runOnDetached = runOnSourceName(SystemEvents.detachedFromDom());
const runOnInit = runOnSourceName(SystemEvents.systemInit());
const runOnExecute = runOnName(SystemEvents.execute());
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