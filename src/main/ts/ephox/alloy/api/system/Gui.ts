import { Arr, Fun, Result, Option } from '@ephox/katamari';
import { Compare, Focus, Node, Remove, Traverse } from '@ephox/sugar';
import { SugarEvent } from 'ephox/alloy/alien/TypeDefinitions';
import { SimulatedEventTargets } from 'ephox/alloy/events/SimulatedEvent';

import * as Debugging from '../../debugging/Debugging';
import * as DescribedHandler from '../../events/DescribedHandler';
import * as GuiEvents from '../../events/GuiEvents';
import * as Triggers from '../../events/Triggers';
import Registry from '../../registry/Registry';
import * as Tagger from '../../registry/Tagger';
import * as GuiFactory from '../component/GuiFactory';
import * as SystemEvents from '../events/SystemEvents';
import { Container } from '../ui/Container';
import * as Attachment from './Attachment';
import { AlloySystemApi, SystemApi } from './SystemApi';

const create = function () {
  const root = GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      }
    })
  );
  return takeover(root);
};

const takeover = function (root) {
  const isAboveRoot = function (el) {
    return Traverse.parent(root.element()).fold(
      function () {
        return true;
      },
      function (parent) {
        return Compare.eq(el, parent);
      }
    );
  };

  const registry = Registry();

  const lookup = function (eventName, target) {
    return registry.find(isAboveRoot, eventName, target);
  };

  const domEvents = GuiEvents.setup(root.element(), {
    triggerEvent (eventName: string, event: SugarEvent) {
      return Debugging.monitorEvent(eventName, event.target(), function (logger) {
        return Triggers.triggerUntilStopped(lookup, eventName, event, logger);
      });
    },

    // This doesn't follow usual DOM bubbling. It will just dispatch on all
    // targets that have the event. It is the general case of the more specialised
    // "message". "messages" may actually just go away. This is used for things
    // like window scroll.
    broadcastEvent (eventName: string, event: SugarEvent) {
      const listeners = registry.filter(eventName);
      return Triggers.broadcast(listeners, event);
    }
  });

  const systemApi = SystemApi({
    // This is a real system
    debugInfo: Fun.constant('real'),
    triggerEvent (eventName, target, data) {
      Debugging.monitorEvent(eventName, target, function (logger) {
        // The return value is not used because this is a fake event.
        Triggers.triggerOnUntilStopped(lookup, eventName, data, target, logger);
      });
    },
    triggerFocus (target, originator) {
      Tagger.read(target).fold(function () {
        // When the target is not within the alloy system, dispatch a normal focus event.
        Focus.focus(target);
      }, function (_alloyId) {
        Debugging.monitorEvent(SystemEvents.focus(), target, function (logger) {
          Triggers.triggerHandler(lookup, SystemEvents.focus(), {
            // originator is used by the default events to ensure that focus doesn't
            // get called infinitely
            originator: Fun.constant(originator),
            target: Fun.constant(target)
          }, target, logger);
        });
      });
    },

    triggerEscape (comp, simulatedEvent) {
      systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
    },

    getByUid (uid) {
      return getByUid(uid);
    },
    getByDom (elem) {
      return getByDom(elem);
    },
    build: GuiFactory.build,
    addToGui (c) { add(c); },
    removeFromGui (c) { remove(c); },
    addToWorld (c) { addToWorld(c); },
    removeFromWorld (c) { removeFromWorld(c); },
    broadcast (message) {
      broadcast(message);
    },
    broadcastOn (channels, message) {
      broadcastOn(channels, message);
    }
  }) as AlloySystemApi;

  const addToWorld = function (component) {
    component.connect(systemApi);
    if (!Node.isText(component.element())) {
      registry.register(component);
      Arr.each(component.components(), addToWorld);
      systemApi.triggerEvent(SystemEvents.systemInit(), component.element(), { target: Fun.constant(component.element()) });
    }
  };

  const removeFromWorld = function (component) {
    if (!Node.isText(component.element())) {
      Arr.each(component.components(), removeFromWorld);
      registry.unregister(component);
    }
    component.disconnect();
  };

  const add = function (component) {
    Attachment.attach(root, component);
  };

  const remove = function (component) {
    Attachment.detach(component);
  };

  const destroy = function () {
    // INVESTIGATE: something with registry?
    domEvents.unbind();
    Remove.remove(root.element());
  };

  const broadcastData = function (data) {
    const receivers = registry.filter(SystemEvents.receive());
    Arr.each(receivers, function (receiver) {
      const descHandler = receiver.descHandler();
      const handler = DescribedHandler.getHandler(descHandler);
      handler(data);
    });
  };

  const broadcast = function (message) {
    broadcastData({
      universal: Fun.constant(true),
      data: Fun.constant(message)
    });
  };

  const broadcastOn = function (channels, message) {
    broadcastData({
      universal: Fun.constant(false),
      channels: Fun.constant(channels),
      data: Fun.constant(message)
    });
  };

  const getByUid = function (uid) {
    return registry.getById(uid).fold(function () {
      return Result.error(
        new Error('Could not find component with uid: "' + uid + '" in system.')
      );
    }, Result.value);
  };

  const getByDom = function (elem) {
    return Tagger.read(elem).bind(getByUid);
  };

  addToWorld(root);

  return {
    root: Fun.constant(root),
    element: root.element,
    destroy,
    add,
    remove,
    getByUid,
    getByDom,

    addToWorld,
    removeFromWorld,

    broadcast,
    broadcastOn
  };
};

export {
  create,
  takeover
};