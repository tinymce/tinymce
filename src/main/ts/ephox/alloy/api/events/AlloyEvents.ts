import { Objects } from '@ephox/boulder';

import * as EventRoot from '../../alien/EventRoot';
import * as EventHandler from '../../construct/EventHandler';
import * as AlloyTriggers from './AlloyTriggers';
import SystemEvents from './SystemEvents';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface EventHandlerConfig {
  key: string;
  value: {
    can: () => boolean;
    abort: () => boolean;
    run: (component: AlloyComponent, simulatedEvent: (any) => any) => any;
  };
}

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

const preventDefault = function (name) {
  return {
    key: name,
    value: EventHandler.nu({
      run (component, simulatedEvent) {
        simulatedEvent.event().prevent();
      }
    })
  };
};

const run = function (name, handler) {
  return {
    key: name,
    value: EventHandler.nu({
      run: handler
    })
  };
};

const runActionExtra = function (name, action, extra) {
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
  return run(name, function (component, simulatedEvent) {
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