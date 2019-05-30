import { Arr, Option } from '@ephox/katamari';
import { Body, Insert, Remove, Traverse, Element } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { GuiSystem } from '../../api/system/Gui';

import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';

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
  parent.getSystem().addToWorld(child);
  insertion(parent.element(), child.element());
  if (Body.inBody(parent.element())) { fireAttaching(child); }
  parent.syncComponents();
};

const doDetach = (component) => {
  fireDetaching(component);
  Remove.remove(component.element());
  component.getSystem().removeFromWorld(component);
};

const detach = (component: AlloyComponent): void => {
  const parent = Traverse.parent(component.element()).bind((p) => {
    return component.getSystem().getByDom(p).fold(Option.none, Option.some);
  });

  doDetach(component);
  parent.each((p) => {
    p.syncComponents();
  });
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  const subs = component.components();
  Arr.each(subs, doDetach);
  // Clear the component also.
  Remove.empty(component.element());
  component.syncComponents();
};

const attachSystem = (element: Element, guiSystem: GuiSystem): void => {
  attachSystemInternal(element, guiSystem, Insert.append);
};

const attachSystemAfter = (element: Element, guiSystem: GuiSystem): void => {
  attachSystemInternal(element, guiSystem, Insert.after);
};

const attachSystemInternal = (element: Element, guiSystem: GuiSystem, inserter: (marker: Element, element: Element) => void): void => {
  inserter(element, guiSystem.element());
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, (child) => {
    guiSystem.getByDom(child).each(fireAttaching);
  });
};

const detachSystem = (guiSystem: GuiSystem): void => {
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, (child) => {
    guiSystem.getByDom(child).each(fireDetaching);
  });
  Remove.remove(guiSystem.element());
};

export {
  attach,
  attachWith,
  detach,
  detachChildren,

  attachSystem,
  attachSystemAfter,

  detachSystem
};