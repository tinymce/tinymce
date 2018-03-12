import { Arr, Option } from '@ephox/katamari';
import { Body, Insert, Remove, Traverse } from '@ephox/sugar';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { GuiSystem } from 'ephox/alloy/api/system/Gui';

import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';

const fireDetaching = function (component) {
  AlloyTriggers.emit(component, SystemEvents.detachedFromDom());
  const children = component.components();
  Arr.each(children, fireDetaching);
};

const fireAttaching = function (component) {
  const children = component.components();
  Arr.each(children, fireAttaching);
  AlloyTriggers.emit(component, SystemEvents.attachedToDom());
};

const attach = function (parent: AlloyComponent, child: AlloyComponent): void {
  attachWith(parent, child, Insert.append);
};

const attachWith = function (parent: AlloyComponent, child: AlloyComponent, insertion: (parent: SugarElement, child: SugarElement) => void): void {
  parent.getSystem().addToWorld(child);
  insertion(parent.element(), child.element());
  if (Body.inBody(parent.element())) { fireAttaching(child); }
  parent.syncComponents();
};

const doDetach = function (component) {
  fireDetaching(component);
  Remove.remove(component.element());
  component.getSystem().removeFromWorld(component);
};

const detach = function (component: AlloyComponent): void {
  const parent = Traverse.parent(component.element()).bind(function (p) {
    return component.getSystem().getByDom(p).fold(Option.none, Option.some);
  });

  doDetach(component);
  parent.each(function (p) {
    p.syncComponents();
  });
};

const detachChildren = function (component: AlloyComponent): void {
  // This will not detach the component, but will detach its children and sync at the end.
  const subs = component.components();
  Arr.each(subs, doDetach);
  // Clear the component also.
  Remove.empty(component.element());
  component.syncComponents();
};

const attachSystem = function (element: SugarElement, guiSystem: GuiSystem): void {
  Insert.append(element, guiSystem.element());
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, function (child) {
    guiSystem.getByDom(child).each(fireAttaching);
  });
};

const detachSystem = function (guiSystem: GuiSystem): void {
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, function (child) {
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
  detachSystem
};