import { Arr } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AriaFocus from '../../aria/AriaFocus';
import { patchSpecChildren } from '../../dom/Patching';
import * as InternalAttachment from '../../system/InternalAttachment';

const withoutReuse = (parent: AlloyComponent, data: AlloySpec[]): void => {
  AriaFocus.preserve(() => {
    InternalAttachment.replaceChildren(parent, data, () => Arr.map(data, parent.getSystem().build));
  }, parent.element);
};

const withReuse = (parent: AlloyComponent, data: AlloySpec[]): void => {
  // Note: We shouldn't need AriaPreserve since we're trying to keep the existing elements,
  // but let's just do it for now just to be safe.
  AriaFocus.preserve(() => {
    InternalAttachment.virtualReplaceChildren(parent, data, () => {
      // Build the new children
      return patchSpecChildren(
        parent.element,
        data,
        (d, i) => {
          const optObsoleted = Traverse.child(parent.element, i);
          return parent.getSystem().buildOrPatch(d, optObsoleted);
        }
      );
    });
  }, parent.element);
};

export {
  withoutReuse,
  withReuse
};
