import { Arr } from '@ephox/katamari';
import { Insert, Remove, SugarBody } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { AlloySpec } from '../api/component/SpecTypes';
import * as AlloyTriggers from '../api/events/AlloyTriggers';
import * as SystemEvents from '../api/events/SystemEvents';
import * as GuiTypes from '../api/ui/GuiTypes';

const isConnected = (comp: AlloyComponent) =>
  comp.getSystem().isConnected();

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
const virtualDetach = (comp: AlloyComponent): void => {
  fireDetaching(comp);
  comp.getSystem().removeFromWorld(comp);
};

const attach = (parent: AlloyComponent, child: AlloyComponent): void => {
  Insert.append(parent.element, child.element);
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  Arr.each(component.components(), (childComp) => Remove.remove(childComp.element));
  // Clear the component also.
  Remove.empty(component.element);
  component.syncComponents();
};

const replaceChildren = (component: AlloyComponent, newSpecs: AlloySpec[], buildNewChildren: (newSpecs: AlloySpec[]) => AlloyComponent[]): void => {
  // Detach all existing children
  const subs = component.components();
  detachChildren(component);

  const newChildren = buildNewChildren(newSpecs);

  // Determine which components have been deleted and remove them from the world
  const deleted = Arr.difference(subs, newChildren);
  Arr.each(deleted, (comp) => {
    fireDetaching(comp);
    component.getSystem().removeFromWorld(comp);
  });

  // Add all new components
  Arr.each(newChildren, (childComp) => {
    // If the component isn't connected, ie is new, then we also need to add it to the world
    if (!isConnected(childComp)) {
      component.getSystem().addToWorld(childComp);
      attach(component, childComp);
      if (SugarBody.inBody(component.element)) {
        fireAttaching(childComp);
      }
    } else {
      attach(component, childComp);
    }
  });
  component.syncComponents();
};

const virtualReplaceChildren = (component: AlloyComponent, newSpecs: AlloySpec[], buildNewChildren: (newSpecs: AlloySpec[]) => AlloyComponent[]): void => {
  // When replacing we don't want to fire detachedFromDom and attachedToDom again for a premade that has just had its position in the children moved around,
  // so we only detach initially if we aren't a premade. Premades will be detached later, but only if they are no longer in the child list.
  const subs = component.components();
  const existingComps = Arr.bind(newSpecs, (spec) => GuiTypes.getPremade(spec).toArray());
  Arr.each(subs, (childComp) => {
    if (!Arr.contains(existingComps, childComp)) {
      virtualDetach(childComp);
    }
  });

  const newChildren = buildNewChildren(newSpecs);

  // Determine which components have been deleted and remove them from the world
  // It's probable the component has already been detached beforehand so only
  // detach what's still attached to the world (i.e removed premades)
  const deleted = Arr.difference(subs, newChildren);
  Arr.each(deleted, (deletedComp) => {
    if (isConnected(deletedComp)) {
      virtualDetach(deletedComp);
    }
  });

  // Add all new components
  Arr.each(newChildren, (childComp) => {
    // If the component isn't connected, ie is new, then we also need to add it to the world
    if (!isConnected(childComp)) {
      virtualAttach(component, childComp);
    } else {
      // Already attached so do nothing
    }
  });
  component.syncComponents();
};

export {
  fireAttaching,
  fireDetaching,

  detachChildren,
  replaceChildren,

  virtualAttach,
  virtualDetach,
  virtualReplaceChildren
};
