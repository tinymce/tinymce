import { FieldSchema, Objects, ValueSchema } from '@ephox/boulder';
import { Arr, Fun, Options, Option } from '@ephox/katamari';
import { DomEvent, Insert, Element } from '@ephox/sugar';

import * as SimulatedEvent from '../../events/SimulatedEvent';
import ForeignCache from '../../foreign/ForeignCache';
import * as Tagger from '../../registry/Tagger';
import * as GuiFactory from '../component/GuiFactory';
import * as Gui from './Gui';
import { SugarEvent } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { UncurriedHandler } from '../../events/EventRegistry';
import { AlloyBehaviourRecord } from '../behaviour/Behaviour';
import { AlloyEventRecord } from '../events/AlloyEvents';

export interface ForeignGuiSpec {
  root: Element;
  dispatchers: Dispatcher[];
  insertion?: (root: Element, system: Gui.GuiSystem) => void;
}

export interface DispatchedAlloyConfig {
  events?: AlloyEventRecord;
  behaviours: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;
}

export interface Dispatcher {
  getTarget: (elem: Element) => Option<Element>;
  alloyConfig: DispatchedAlloyConfig;
}

export interface ForeignGuiDetail {
  root: Element;
  dispatchers: Dispatcher[];
  insertion: (root: Element, system: Gui.GuiSystem) => void
}

const schema = ValueSchema.objOfOnly([
  FieldSchema.strict('root'),
  FieldSchema.strictArrayOfObj('dispatchers', [
    // Given the initial target, what is the target of this particular behaviour?
    FieldSchema.strict('getTarget'),
    // The configuration for the behaviours
    FieldSchema.strict('alloyConfig')
  ]),
  FieldSchema.defaulted('insertion', (root, system) => {
    Insert.append(root, system.element());
  })
]);

/*
 * ForeignGui is an experimental concept
 *
 * Essentially, the basic idea is that we want to be able to use alloy behaviours and events
 * on elements that were not created by alloy. The common example of this is the contents inside
 * an iframe of an editor. We did not create the content (it is also volatile), but we still
 * want to be able to pinch it, drag it, toggle it etc. However, we don't have Component
 * instances for any of these things inside the alloy root ... they are completely separate.
 *
 * Most behaviours (probably not all) require configuration and a connection to an alloy
 * root to exist for a small amount of time to execute their actions. For this reason, we
 * create an internal alloy root for this foreign object (and insert it using insertion, so
 * for iframes, it would often be inserted at the document level so that it wasn't in the content),
 * and connect and disconnect the external elements to that. The elements themselves store their
 * configuration so that we get garbage collecting benefits (a previous version stored them in
 * a separate map), and that configuration can be retrieved from the element. If it isn't there,
 * it is recreated (and any state with it). The configuration is maintained on the DOM object
 * itself (through DomState), and the connection to the internal alloy root (/system) is removed after
 * execution of the action.
 *
 * The connection to the internal alloy root can be required if the behaviour needs to create additional
 * components (e.g. blockers for dragging). However, because these components are already within
 * the internal alloy root, they don't need to be handled in this way (they are just maintained
 * like normal alloy components having been built by alloy). Therefore, we exit dispatching if the
 * target is within our internal system.
 *
 * A ForeignGui is setup with a list of dispatchers. Dispatchers tell alloy which things should have
 * alloy like behaviour. Note, that each dispatcher has a getTarget, which returns an option of element.
 * The purpose of this is it means that you may choose to add the behaviour to an *ancestor* of the target
 * element (e.g. table) rather than the target element itself (td). The alloyConfig lists the behaviours and
 * events to proxy for this dispatcher.
 */

// Not all events are supported at the moment
const supportedEvents = [
  'click', 'mousedown', 'mousemove', 'touchstart', 'touchend', 'gesturestart', 'touchmove'
];

interface DispatcherMission {
  target: Element;
  dispatcher: Dispatcher;
}

// Find the dispatcher information for the target if available. Note, the
// dispatcher may also change the target.
const findDispatcher = (dispatchers: Dispatcher[], target: Element): Option<DispatcherMission> => {
  return Options.findMap(dispatchers, (dispatcher: Dispatcher) => {
    return dispatcher.getTarget(target).map((newTarget) => {
      return {
        target: newTarget,
        dispatcher: dispatcher
      };
    });
  });
};

const getProxy = <T extends SimulatedEvent.EventFormat>(event: T, target: Element) => {
  // Setup the component wrapping for the target element
  const component = GuiFactory.build(
    GuiFactory.external({ element: target })
  );

  const simulatedEvent = SimulatedEvent.fromTarget(event, target);

  return {
    component: Fun.constant(component),
    simulatedEvent: Fun.constant(simulatedEvent)
  };
};

const engage = (spec: ForeignGuiSpec) => {
  const detail: ForeignGuiDetail = ValueSchema.asRawOrDie('ForeignGui', schema, spec);

  // Creates an inner GUI and inserts it appropriately. This will be used
  // as the system for all behaviours
  const gui = Gui.create();
  detail.insertion(detail.root, gui);

  const cache = ForeignCache();

  const domEvents = Arr.map(supportedEvents, (type) => {
    return DomEvent.bind(detail.root, type, (event) => {
      dispatchTo(type, event);
    });
  });

  const proxyFor = (event, target, descHandler: UncurriedHandler) => {
    // create a simple alloy wrapping around the element, and add it to the world
    const proxy = getProxy(event, target);
    const component = proxy.component();
    gui.addToWorld(component);
    // fire the event
    const handler = descHandler.handler;
    handler(component, proxy.simulatedEvent());

    // now remove from the world and revoke any alloy ids
    unproxy(component);
  };

  const dispatchTo = (type: string, event: SugarEvent): void => {
    /*
     * 1. Check that the event did not originate in our internal alloy root. If it did,
     * we don't need to handle it here. The alloy root will handle it as usual.
     * 2. Find the dispatcher based on the target element. It will find the first dispatcher
     * that matches
     * 3. Retrieve the configuration for this external element from its DOM state or create
     * it if it doesn't already exist
     * 4. If the event is supported:
     * a) create a thin proxy wrapping for the DOM element to have component like APIs
     * b) add it to the internal system
     * c) execute the event handler
     * d) remove it from the internal system and clear any DOM markers (alloy-ids etc)
     */
    if (gui.element().dom().contains(event.target().dom())) { return; }

    // Find if the target has an assigned dispatcher
    findDispatcher(detail.dispatchers, event.target()).each((mission) => {

      // get any info for this current element, creating it if necessary
      const data = cache.getEvents(mission.target, mission.dispatcher.alloyConfig);
      const events = data.evts();

      // if this dispatcher defines this event, proxy it and fire the handler
      if (Objects.hasKey(events, type)) { proxyFor(event, mission.target, events[type]); }
    });
  };

  // Remove any traces of the foreign component from the internal alloy system.
  const unproxy = (component: AlloyComponent): void => {
    gui.removeFromWorld(component);
    Tagger.revoke(component.element());
  };

  // Disconnect the foreign GUI
  const disengage = (): void => {
    Arr.each(domEvents, (e) => {
      e.unbind();
    });
  };

  return {
    dispatchTo,
    unproxy,
    disengage
  };
};

export {
  engage
};