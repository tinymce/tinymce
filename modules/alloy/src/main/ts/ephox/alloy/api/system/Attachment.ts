import { Arr } from '@ephox/katamari';
import { Insert, Element, Traverse, Remove } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { GuiSystem } from '../../api/system/Gui';
import * as InternalAttachment from '../../system/InternalAttachment';

const attach = (parent: AlloyComponent, child: AlloyComponent): void => {
  attachWith(parent, child, Insert.append);
};

const attachWith = (parent: AlloyComponent, child: AlloyComponent, insertion: (parent: Element, child: Element) => void): void => {
  parent.getSystem().addToWorld(child);
  InternalAttachment.attachWith(parent, child, insertion);
};

const detach = (component: AlloyComponent): void => {
  InternalAttachment.detach(component);
  component.getSystem().removeFromWorld(component);
};

const detachChildren = (component: AlloyComponent): void => {
  // This will not detach the component, but will detach its children and sync at the end.
  Arr.each(component.components(), (childComp) => {
    InternalAttachment.doDetach(childComp);
    component.getSystem().removeFromWorld(childComp);
  });
  // Clear the component also.
  Remove.empty(component.element());
  component.syncComponents();
};

const attachSystem = (element: Element, guiSystem: GuiSystem): void => {
  attachSystemWith(element, guiSystem, Insert.append);
};

const attachSystemAfter = (element: Element, guiSystem: GuiSystem): void => {
  attachSystemWith(element, guiSystem, Insert.after);
};

const attachSystemWith = (element: Element, guiSystem: GuiSystem, inserter: (marker: Element, element: Element) => void): void => {
  inserter(element, guiSystem.element());
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, (child) => {
    guiSystem.getByDom(child).each(InternalAttachment.fireAttaching);
  });
};

const detachSystem = (guiSystem: GuiSystem): void => {
  const children = Traverse.children(guiSystem.element());
  Arr.each(children, (child) => {
    guiSystem.getByDom(child).each(InternalAttachment.fireDetaching);
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
