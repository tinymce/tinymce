import { Arr } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AriaFocus from '../../aria/AriaFocus';
import { patchChildren } from '../../dom/Patching';
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

const withReuse = (parent: AlloyComponent, data: AlloySpec[]): void => {
  // Note: We'll shouldn't need AriaPreserve since we're trying to keep the existing elements,
  // but let's just do it for now just to be safe.
  AriaFocus.preserve(() => {
    // Firstly, virtually detach all the children
    InternalAttachment.virtualDetachChildren(parent);

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

    // Finally, reattach the children and sync the parent components
    Arr.each(children, (child) => {
      InternalAttachment.virtualAttach(parent, child);
    });
    parent.syncComponents();
  }, parent.element);
};

export {
  withoutReuse,
  withReuse
};
