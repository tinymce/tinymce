import { Arr } from '@ephox/katamari';
import { Body, Insert, Remove } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';

const fireDetaching = (component: AlloyComponent) => {
  AlloyTriggers.emit(component, SystemEvents.detachedFromDom());
  const children = component.components();
  Arr.each(children, fireDetaching);
};

const fireAttaching = (component: AlloyComponent) => {
  const children = component.components();
  Arr.each(children, fireAttaching);
  AlloyTriggers.emit(component, SystemEvents.attachedToDom());
};

const attach = (parent: AlloyComponent, child: AlloyComponent) => {
  Insert.append(parent.element(), child.element());
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  Arr.each(component.components(), (childComp) => Remove.remove(childComp.element()));
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
  Arr.each(deleted, (comp) => {
    fireDetaching(comp);
    component.getSystem().removeFromWorld(comp);
  });

  // Add all new components
  Arr.each(newChildren, (childComp) => {
    // If the component isn't connected, ie is new, then we also need to add it to the world
    if (!childComp.getSystem().isConnected()) {
      component.getSystem().addToWorld(childComp);
      attach(component, childComp);
      if (Body.inBody(component.element())) { fireAttaching(childComp); }
    } else {
      attach(component, childComp);
    }
    component.syncComponents();
  });
};

export {
  fireAttaching,
  fireDetaching,

  detachChildren,

  replaceChildren
};
