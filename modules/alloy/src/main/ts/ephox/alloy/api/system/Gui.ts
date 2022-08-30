import { Arr, Fun, Result } from '@ephox/katamari';
import { Compare, EventArgs, Focus, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as Debugging from '../../debugging/Debugging';
import * as DescribedHandler from '../../events/DescribedHandler';
import * as GuiEvents from '../../events/GuiEvents';
import { FocusingEvent, ReceivingInternalEvent } from '../../events/SimulatedEvent';
import * as Triggers from '../../events/Triggers';
import { Registry } from '../../registry/Registry';
import * as Tagger from '../../registry/Tagger';
import { AlloyComponent } from '../component/ComponentApi';
import * as GuiFactory from '../component/GuiFactory';
import * as SystemEvents from '../events/SystemEvents';
import { Container } from '../ui/Container';
import * as Attachment from './Attachment';
import { AlloySystemApi } from './SystemApi';

export interface GuiSystem {
  readonly root: AlloyComponent;
  readonly element: SugarElement<HTMLElement>;
  readonly destroy: () => void;
  readonly add: (component: AlloyComponent) => void;
  readonly remove: (component: AlloyComponent) => void;
  readonly getByUid: (uid: string) => Result<AlloyComponent, Error>;
  readonly getByDom: (element: SugarElement<Node>) => Result<AlloyComponent, Error>;

  readonly addToWorld: (comp: AlloyComponent) => void;
  readonly removeFromWorld: (comp: AlloyComponent) => void;

  readonly broadcast: <T>(message: T) => void;
  readonly broadcastOn: <T>(channels: string[], message: T) => void;

  // TODO FIXME this is no longer tested directly
  readonly broadcastEvent: (eventName: string, event: EventArgs) => void;
}

const create = (): GuiSystem => {
  const root = GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      }
    })
  );
  return takeover(root);
};

const takeover = (root: AlloyComponent): GuiSystem => {
  const isAboveRoot = (el: SugarElement<Node>): boolean => Traverse.parent(root.element).fold(
    Fun.always,
    (parent) => Compare.eq(el, parent)
  );

  const registry = Registry();

  const lookup = (eventName: string, target: SugarElement<Node>) => registry.find(isAboveRoot, eventName, target);

  const domEvents = GuiEvents.setup(root.element, {
    triggerEvent: (eventName, event) => {
      return Debugging.monitorEvent(eventName, event.target, (logger: Debugging.DebuggerLogger) => Triggers.triggerUntilStopped(lookup, eventName, event, logger));
    }
  });

  const systemApi: AlloySystemApi = {
    // This is a real system
    debugInfo: Fun.constant('real'),
    triggerEvent: (eventName: string, target: SugarElement<Node>, data: any) => {
      Debugging.monitorEvent(eventName, target, (logger: Debugging.DebuggerLogger) =>
        // The return value is not used because this is a fake event.
        Triggers.triggerOnUntilStopped(lookup, eventName, data, target, logger)
      );
    },
    triggerFocus: (target: SugarElement<HTMLElement>, originator: SugarElement<Node>) => {
      Tagger.read(target).fold(() => {
        // When the target is not within the alloy system, dispatch a normal focus event.
        Focus.focus(target);
      }, (_alloyId) => {
        Debugging.monitorEvent(SystemEvents.focus(), target, (logger: Debugging.DebuggerLogger) => {
          // NOTE: This will stop at first handler.
          Triggers.triggerHandler<FocusingEvent>(lookup, SystemEvents.focus(), {
            // originator is used by the default events to ensure that focus doesn't
            // get called infinitely
            originator,
            kill: Fun.noop,
            prevent: Fun.noop,
            target
          }, target, logger);
          return false;
        });
      });
    },

    triggerEscape: (comp, simulatedEvent) => {
      systemApi.triggerEvent('keydown', comp.element, simulatedEvent.event);
    },

    getByUid: (uid) => {
      return getByUid(uid);
    },
    getByDom: (elem) => {
      return getByDom(elem);
    },
    build: GuiFactory.build,
    buildOrPatch: GuiFactory.buildOrPatch,
    addToGui: (c) => {
      add(c);
    },
    removeFromGui: (c) => {
      remove(c);
    },
    addToWorld: (c) => {
      addToWorld(c);
    },
    removeFromWorld: (c) => {
      removeFromWorld(c);
    },
    broadcast: (message) => {
      broadcast(message);
    },
    broadcastOn: (channels, message) => {
      broadcastOn(channels, message);
    },
    broadcastEvent: (eventName: string, event: EventArgs) => {
      broadcastEvent(eventName, event);
    },
    isConnected: Fun.always
  };

  const addToWorld = (component: AlloyComponent) => {
    component.connect(systemApi);
    if (!SugarNode.isText(component.element)) {
      registry.register(component);
      Arr.each(component.components(), addToWorld);
      systemApi.triggerEvent(SystemEvents.systemInit(), component.element, { target: component.element });
    }
  };

  const removeFromWorld = (component: AlloyComponent) => {
    if (!SugarNode.isText(component.element)) {
      Arr.each(component.components(), removeFromWorld);
      registry.unregister(component);
    }
    component.disconnect();
  };

  const add = (component: AlloyComponent) => {
    Attachment.attach(root, component);
  };

  const remove = (component: AlloyComponent) => {
    Attachment.detach(component);
  };

  const destroy = () => {
    // INVESTIGATE: something with registry?
    domEvents.unbind();
    Remove.remove(root.element);
  };

  const broadcastData = (data: ReceivingInternalEvent) => {
    const receivers = registry.filter(SystemEvents.receive());
    Arr.each(receivers, (receiver) => {
      const descHandler = receiver.descHandler;
      const handler = DescribedHandler.getCurried(descHandler);
      handler(data);
    });
  };

  const broadcast = <T>(message: T) => {
    broadcastData({
      universal: true,
      data: message
    });
  };

  const broadcastOn = <T>(channels: string[], message: T) => {
    broadcastData({
      universal: false,
      channels,
      data: message
    });
  };

  // This doesn't follow usual DOM bubbling. It will just dispatch on all
  // targets that have the event. It is the general case of the more specialised
  // "message". "messages" may actually just go away. This is used for things
  // like window scroll.
  const broadcastEvent = (eventName: string, event: EventArgs) => {
    const listeners = registry.filter(eventName);
    return Triggers.broadcast(listeners, event);
  };

  const getByUid = (uid: string) => registry.getById(uid).fold(() => Result.error<AlloyComponent, Error>(
    new Error('Could not find component with uid: "' + uid + '" in system.')
  ), Result.value);

  const getByDom = (elem: SugarElement<Node>): Result<AlloyComponent, Error> => {
    const uid = Tagger.read(elem).getOr('not found');
    return getByUid(uid);
  };

  addToWorld(root);

  return {
    root,
    element: root.element,
    destroy,
    add,
    remove,
    getByUid,
    getByDom,

    addToWorld,
    removeFromWorld,

    broadcast,
    broadcastOn,

    broadcastEvent
  };
};

export {
  create,
  takeover
};
