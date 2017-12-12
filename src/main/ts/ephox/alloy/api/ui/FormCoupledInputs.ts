import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Representing from '../behaviour/Representing';
import Sketcher from './Sketcher';
import AlloyParts from '../../parts/AlloyParts';
import FormCoupledInputsSchema from '../../ui/schema/FormCoupledInputsSchema';
import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

var factory = function (detail, components, spec, externals) {
  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: components,

    behaviours: Behaviour.derive([
      Composing.config({ find: Option.some }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue: function (comp) {
            var parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            return {
              field1: Representing.getValue(parts.field1()),
              field2: Representing.getValue(parts.field2())
            };
          },
          setValue: function (comp, value) {
            var parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            if (Objects.hasKey(value, 'field1')) Representing.setValue(parts.field1(), value.field1);
            if (Objects.hasKey(value, 'field2')) Representing.setValue(parts.field2(), value.field2);
          }
        }
      })
    ])
  };
};

export default <any> Sketcher.composite({
  name: 'FormCoupledInputs',
  configFields: FormCoupledInputsSchema.schema(),
  partFields: FormCoupledInputsSchema.parts(),
  factory: factory
});