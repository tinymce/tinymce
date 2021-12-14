import { Arr, Optional } from '@ephox/katamari';
import { Compare, Insert, SugarElement, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as Attachment from '../../api/system/Attachment';
import * as AriaFocus from '../../aria/AriaFocus';
import * as InternalAttachment from '../../system/InternalAttachment';

const withoutReuse = (parent: AlloyComponent, data: AlloySpec[]): void => {
  // NOTE: we may want to create a behaviour which allows you to switch
  // between predefined layouts, which would make a noop detection easier.
  // Until then, we'll just use AriaFocus like redesigning does.
  AriaFocus.preserve(() => {
    const newChildren = Arr.map(data, parent.getSystem().build);
    InternalAttachment.replaceChildren(parent, newChildren);
  }, parent.element);
};

const patchChildren = <T, C>(
  nu: T[],
  process: (t: T, i: number, optObs: Optional<AlloyComponent>) => C,
  toDom: (c: C) => SugarElement,
  parent: SugarElement
): C[] => {
  return [];
};

const withReuse = (parent: AlloyComponent, data: AlloySpec[]): void => {

  // I don't think we'll need AriaPreserve, but let's just do it for now.
  AriaFocus.preserve(() => {
    // Firstly, virtually detach all the children
    Attachment.virtualDetachChildren(parent);

    // Build the new children
    const children: AlloyComponent[] = patchChildren(
      data,
      (d, i) => {
        const optObsoleted = Traverse.child(parent.element, i);
        return parent.getSystem().buildOrPatch(d, optObsoleted);
      },
      (c) => c.element,
      parent.element
    );

    Arr.each(children, (child) => {
      Attachment.virtualAttach(parent, child);
    });
    parent.syncComponents();
  }, parent.element);
};

export {
  withoutReuse,
  withReuse
};