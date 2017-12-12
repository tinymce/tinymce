import GuiFactory from '../component/GuiFactory';
import SystemEvents from '../events/SystemEvents';
import Attachment from './Attachment';
import SystemApi from './SystemApi';
import Container from '../ui/Container';
import Debugging from '../../debugging/Debugging';
import DescribedHandler from '../../events/DescribedHandler';
import GuiEvents from '../../events/GuiEvents';
import Triggers from '../../events/Triggers';
import AlloyLogger from '../../log/AlloyLogger';
import Registry from '../../registry/Registry';
import Tagger from '../../registry/Tagger';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Focus } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var create = function () {
  var root = GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      }
    })
  );
  return takeover(root);
};

var takeover = function (root) {
  var isAboveRoot = function (el) {
    return Traverse.parent(root.element()).fold(
      function () {
        return true;
      },
      function (parent) {
        return Compare.eq(el, parent);
      }
    );
  };

  var registry = Registry();

  var lookup = function (eventName, target) {
    return registry.find(isAboveRoot, eventName, target);
  };

  var domEvents = GuiEvents.setup(root.element(), {
    triggerEvent: function (eventName, event) {
      return Debugging.monitorEvent(eventName, event.target(), function (logger) {
        return Triggers.triggerUntilStopped(lookup, eventName, event, logger);
      });
    },

    // This doesn't follow usual DOM bubbling. It will just dispatch on all
    // targets that have the event. It is the general case of the more specialised
    // "message". "messages" may actually just go away. This is used for things
    // like window scroll.
    broadcastEvent: function (eventName, event) {
      var listeners = registry.filter(eventName);
      return Triggers.broadcast(listeners, event);
    }
  });

  var systemApi = SystemApi({
    // This is a real system
    debugInfo: Fun.constant('real'),
    triggerEvent: function (customType, target, data) {
      Debugging.monitorEvent(customType, target, function (logger) {
        // The return value is not used because this is a fake event.
        Triggers.triggerOnUntilStopped(lookup, customType, data, target, logger);
      });
    },
    triggerFocus: function (target, originator) {
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

    triggerEscape: function (comp, simulatedEvent) {
      systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
    },

    getByUid: function (uid) {
      return getByUid(uid);
    },
    getByDom: function (elem) {
      return getByDom(elem);
    },
    build: GuiFactory.build,
    addToGui: function (c) { add(c); },
    removeFromGui: function (c) { remove(c); },
    addToWorld: function (c) { addToWorld(c); },
    removeFromWorld: function (c) { removeFromWorld(c); },
    broadcast: function (message) {
      broadcast(message);
    },
    broadcastOn: function (channels, message) {
      broadcastOn(channels, message);
    }
  });

  var addToWorld = function (component) {
    component.connect(systemApi);
    if (!Node.isText(component.element())) {
      registry.register(component);
      Arr.each(component.components(), addToWorld);
      systemApi.triggerEvent(SystemEvents.systemInit(), component.element(), { target: Fun.constant(component.element()) });
    }
  };

  var removeFromWorld = function (component) {
    if (!Node.isText(component.element())) {
      Arr.each(component.components(), removeFromWorld);
      registry.unregister(component);
    }
    component.disconnect();
  };

  var add = function (component) {
    Attachment.attach(root, component);
  };

  var remove = function (component) {
    Attachment.detach(component);
  };

  var destroy = function () {
    // INVESTIGATE: something with registry?
    domEvents.unbind();
    Remove.remove(root.element());
  };

  var broadcastData = function (data) {
    var receivers = registry.filter(SystemEvents.receive());
    Arr.each(receivers, function (receiver) {
      var descHandler = receiver.descHandler();
      var handler = DescribedHandler.getHandler(descHandler);
      handler(data);
    });
  };

  var broadcast = function (message) {
    broadcastData({
      universal: Fun.constant(true),
      data: Fun.constant(message)
    });
  };

  var broadcastOn = function (channels, message) {
    broadcastData({
      universal: Fun.constant(false),
      channels: Fun.constant(channels),
      data: Fun.constant(message)
    });
  };

  var getByUid = function (uid) {
    return registry.getById(uid).fold(function () {
      return Result.error(
        new Error('Could not find component with uid: "' + uid + '" in system.')
      );
    }, Result.value);
  };

  var getByDom = function (elem) {
    return Tagger.read(elem).bind(getByUid);
  };

  addToWorld(root);

  return {
    root: Fun.constant(root),
    element: root.element,
    destroy: destroy,
    add: add,
    remove: remove,
    getByUid: getByUid,
    getByDom: getByDom,

    addToWorld: addToWorld,
    removeFromWorld: removeFromWorld,

    broadcast: broadcast,
    broadcastOn: broadcastOn
  };
};

export default <any> {
  create: create,
  takeover: takeover
};