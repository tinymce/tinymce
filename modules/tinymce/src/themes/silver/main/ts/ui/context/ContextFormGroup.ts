import { AlloySpec, FormField, SketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

export const createContextFormFieldFromParts = (pLabel: Optional<AlloySpec>, pField: AlloySpec): SketchSpec => FormField.sketch({
  dom: {
    tag: 'div',
    classes: [ 'tox-context-form__group' ]
  },
  components: [ ...pLabel.toArray(), pField ]
});

