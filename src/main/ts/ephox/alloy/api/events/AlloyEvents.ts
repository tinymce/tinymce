import EventRoot from '../../alien/EventRoot';
import AlloyTriggers from './AlloyTriggers';
import SystemEvents from './SystemEvents';
import EventHandler from '../../construct/EventHandler';
import { Objects } from '@ephox/boulder';

var derive = Objects.wrapAll;

var abort = function (name, predicate) {
  return {
    key: name,
    value: EventHandler.nu({
      abort: predicate
    })
  };
};

var can = function (name, predicate) {
  return {
    key: name,
    value: EventHandler.nu({
      can: predicate
    })
  };
};

var preventDefault = function (name) {
  return {
    key: name,
    value: EventHandler.nu({
      run: function (component, simulatedEvent) {
        simulatedEvent.event().prevent();
      }
    })
  };
};

var run = function (name, handler) {
  return {
    key: name,
    value: EventHandler.nu({
      run: handler
    })
  };
};

var runActionExtra = function (name, action, extra) {
  return {
    key: name,
    value: EventHandler.nu({
      run: function (component) {
        action.apply(undefined, [ component ].concat(extra));
      }
    })
  };
};

var runOnName = function (name) {
  return function (handler) {
    return run(name, handler);
  };
};

var runOnSourceName = function (name) {
  return function (handler) {
    return {
      key: name,
      value: EventHandler.nu({
        run: function (component, simulatedEvent) {
          if (EventRoot.isSource(component, simulatedEvent)) handler(component, simulatedEvent);
        }
      })
    };
  };
};

var redirectToUid = function (name, uid) {
  return run(name, function (component, simulatedEvent) {
    component.getSystem().getByUid(uid).each(function (redirectee) {
      AlloyTriggers.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
    });
  });
};

var redirectToPart = function (name, detail, partName) {
  var uid = detail.partUids()[partName];
  return redirectToUid(name, uid);
};

var runWithTarget = function (name, f) {
  return run(name, function (component, simulatedEvent) {
    component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
      f(component, target, simulatedEvent);
    });
  });
};

var cutter = function (name) {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.cut();
  });
};

var stopper = function (name) {
  return run(name, function (component, simulatedEvent) {
    simulatedEvent.stop();
  });
};

export default <any> {
  derive: derive,
  run: run,
  preventDefault: preventDefault,
  runActionExtra: runActionExtra,
  runOnAttached: runOnSourceName(SystemEvents.attachedToDom()),
  runOnDetached: runOnSourceName(SystemEvents.detachedFromDom()),
  runOnInit: runOnSourceName(SystemEvents.systemInit()),
  runOnExecute: runOnName(SystemEvents.execute()),

  redirectToUid: redirectToUid,
  redirectToPart: redirectToPart,
  runWithTarget: runWithTarget,
  abort: abort,
  can: can,
  cutter: cutter,
  stopper: stopper
};