import AlloyTriggers from '../events/AlloyTriggers';
import SystemEvents from '../events/SystemEvents';
import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Body } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var fireDetaching = function (component) {
  AlloyTriggers.emit(component, SystemEvents.detachedFromDom());
  var children = component.components();
  Arr.each(children, fireDetaching);
};

var fireAttaching = function (component) {
  var children = component.components();
  Arr.each(children, fireAttaching);
  AlloyTriggers.emit(component, SystemEvents.attachedToDom());
};

var attach = function (parent, child) {
  attachWith(parent, child, Insert.append);
};

var attachWith = function (parent, child, insertion) {
  parent.getSystem().addToWorld(child);
  insertion(parent.element(), child.element());
  if (Body.inBody(parent.element())) fireAttaching(child);
  parent.syncComponents();
};

var doDetach = function (component) {
  fireDetaching(component);
  Remove.remove(component.element());
  component.getSystem().removeFromWorld(component);
};

var detach = function (component) {
  var parent = Traverse.parent(component.element()).bind(function (p) {
    return component.getSystem().getByDom(p).fold(Option.none, Option.some);
  });

  doDetach(component);
  parent.each(function (p) {
    p.syncComponents();
  });
};

var detachChildren = function (component) {
  // This will not detach the component, but will detach its children and sync at the end.
  var subs = component.components();
  Arr.each(subs, doDetach);
  // Clear the component also.
  Remove.empty(component.element());
  component.syncComponents();
};

var attachSystem = function (element, guiSystem) {
  Insert.append(element, guiSystem.element());
  var children = Traverse.children(guiSystem.element());
  Arr.each(children, function (child) {
    guiSystem.getByDom(child).each(fireAttaching);
  });
};

var detachSystem = function (guiSystem) {
  var children = Traverse.children(guiSystem.element());
  Arr.each(children, function (child) {
    guiSystem.getByDom(child).each(fireDetaching);
  });
  Remove.remove(guiSystem.element());
};

export default <any> {
  attach: attach,
  attachWith: attachWith,
  detach: detach,
  detachChildren: detachChildren,

  attachSystem: attachSystem,
  detachSystem: detachSystem
};