import { Arr } from '@ephox/katamari';
import { Insert, Remove, SugarBody } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';

const fireDetaching = (component: AlloyComponent): void => {
  AlloyTriggers.emit(component, SystemEvents.detachedFromDom());
  const children = component.components();
  Arr.each(children, fireDetaching);
};

const fireAttaching = (component: AlloyComponent): void => {
  const children = component.components();
  Arr.each(children, fireAttaching);
  AlloyTriggers.emit(component, SystemEvents.attachedToDom());
};

// Unlike attach, a virtualAttach makes no actual DOM changes.
// This is because it should only be used in a situation
// where we are patching an existing element.
const virtualAttach = (parent: AlloyComponent, child: AlloyComponent): void => {
  // So we still add it to the world
  parent.getSystem().addToWorld(child);
  // And we fire attaching ONLY if it's already in the DOM
  if (SugarBody.inBody(parent.element)) {
    fireAttaching(child);
  }
};

// Unlike detach, a virtualDetach makes no actual DOM changes.
// This is because it's used in patching circumstances.
const doVirtualDetach = (comp: AlloyComponent): void => {
  fireDetaching(comp);
  comp.getSystem().removeFromWorld(comp);
};

const virtualDetachChildren = (comp: AlloyComponent): void => {
  // This will not detach the component, but will detach its children (virtually) and sync at the end.
  // Note: This doesn't sync the components as no DOM changes are made.
  const subs = comp.components();
  Arr.each(subs, doVirtualDetach);
};

const doAttach = (parent: AlloyComponent, child: AlloyComponent): void => {
  Insert.append(parent.element, child.element);
};

const attach = (parent: AlloyComponent, child: AlloyComponent): void => {
  parent.getSystem().addToWorld(child);
  doAttach(parent, child);
  if (SugarBody.inBody(parent.element)) {
    fireAttaching(child);
  }
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  Arr.each(component.components(), (childComp) => Remove.remove(childComp.element));
  // Clear the component also.
  Remove.empty(component.element);
  component.syncComponents();
};

const replaceChildren = (component: AlloyComponent, newChildren: AlloyComponent[]): void => {
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
      attach(component, childComp);
    } else {
      doAttach(component, childComp);
    }
  });
  component.syncComponents();
};

export {
  fireAttaching,
  fireDetaching,

  attach,
  detachChildren,
  replaceChildren,

  virtualAttach,
  virtualDetachChildren
};
