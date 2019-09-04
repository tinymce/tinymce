import { Arr } from '@ephox/katamari';
import { Body, Insert, Remove, Traverse, Element } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';

const fireDetaching = (component) => {
  AlloyTriggers.emit(component, SystemEvents.detachedFromDom());
  const children = component.components();
  Arr.each(children, fireDetaching);
};

const fireAttaching = (component) => {
  const children = component.components();
  Arr.each(children, fireAttaching);
  AlloyTriggers.emit(component, SystemEvents.attachedToDom());
};

const attach = (parent: AlloyComponent, child: AlloyComponent): void => {
  attachWith(parent, child, Insert.append);
};

const attachWith = (parent: AlloyComponent, child: AlloyComponent, insertion: (parent: Element, child: Element) => void): void => {
  insertion(parent.element(), child.element());
  if (Body.inBody(parent.element())) { fireAttaching(child); }
  parent.syncComponents();
};

const doDetach = (component: AlloyComponent) => {
  fireDetaching(component);
  Remove.remove(component.element());
};

const detach = (component: AlloyComponent): void => {
  const parent = Traverse.parent(component.element()).bind((p) => {
    return component.getSystem().getByDom(p).toOption();
  });

  doDetach(component);
  parent.each((p) => {
    p.syncComponents();
  });
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  Arr.each(component.components(), doDetach);
  // Clear the component also.
  Remove.empty(component.element());
  component.syncComponents();
};

const replaceChildren = (component: AlloyComponent, newChildren: AlloyComponent[]) => {
  // Detach all existing children
  const subs = component.components();
  detachChildren(component);

  // Determine which components have been deleted and remove them from the world
  const deleted = Arr.difference(subs, newChildren);
  Arr.each(deleted, (comp) => component.getSystem().removeFromWorld(comp));

  // Add all new components
  Arr.each(newChildren, (childComp) => {
    // If the component isn't connected, ie is new, then add it to the world
    if (!childComp.getSystem().isConnected()) {
      component.getSystem().addToWorld(childComp);
    }
    attach(component, childComp);
  });
};

export {
  fireAttaching,
  fireDetaching,

  attach,
  attachWith,

  doDetach,
  detach,
  detachChildren,

  replaceChildren
};
