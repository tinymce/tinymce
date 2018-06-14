import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as Sketcher from './Sketcher';
import * as AlloyParts from '../../parts/AlloyParts';
import * as FormCoupledInputsSchema from '../../ui/schema/FormCoupledInputsSchema';
import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { SketchSpec } from '../../api/component/SpecTypes';
import { FormCoupledInputsSketcher, FormCoupledInputsDetail } from 'ephox/alloy/ui/types/FormCoupledInputsTypes';
import { CompositeSketchFactory } from 'ephox/alloy/api/ui/UiSketcher';

const factory: CompositeSketchFactory<FormCoupledInputsDetail> = function (detail, components, spec, externals): SketchSpec {
  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components,

    behaviours: Behaviour.derive([
      Composing.config({ find: Option.some }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue (comp) {
            const parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            return {
              field1: Representing.getValue(parts.field1()),
              field2: Representing.getValue(parts.field2())
            };
          },
          setValue (comp, value) {
            const parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            if (Objects.hasKey(value, 'field1')) { Representing.setValue(parts.field1(), value.field1); }
            if (Objects.hasKey(value, 'field2')) { Representing.setValue(parts.field2(), value.field2); }
          }
        }
      })
    ])
  };
};

const FormCoupledInputs = Sketcher.composite({
  name: 'FormCoupledInputs',
  configFields: FormCoupledInputsSchema.schema(),
  partFields: FormCoupledInputsSchema.parts(),
  factory
}) as FormCoupledInputsSketcher;

export {
  FormCoupledInputs
};