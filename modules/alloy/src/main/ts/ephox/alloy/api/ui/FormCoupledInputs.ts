import { Obj, Optional } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as FormCoupledInputsSchema from '../../ui/schema/FormCoupledInputsSchema';
import {
  FormCoupledInputsApis, FormCoupledInputsDetail, FormCoupledInputsSketcher, FormCoupledInputsSpec
} from '../../ui/types/FormCoupledInputsTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import { AlloyComponent } from '../component/ComponentApi';
import { SketchBehaviours } from '../component/SketchBehaviours';
import { SketchSpec } from '../component/SpecTypes';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<FormCoupledInputsDetail, FormCoupledInputsSpec> = (detail, components, _spec, _externals): SketchSpec => ({
  uid: detail.uid,
  dom: detail.dom,
  components,

  behaviours: SketchBehaviours.augment(
    detail.coupledFieldBehaviours,
    [
      Composing.config({ find: Optional.some }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue: (comp) => {

            const parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            return {
              [detail.field1Name]: Representing.getValue(parts.field1()),
              [detail.field2Name]: Representing.getValue(parts.field2())
            };
          },
          setValue: (comp, value) => {
            const parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
            if (Obj.hasNonNullableKey(value, detail.field1Name)) {
              Representing.setValue(parts.field1(), value[detail.field1Name]);
            }
            if (Obj.hasNonNullableKey(value, detail.field2Name)) {
              Representing.setValue(parts.field2(), value[detail.field2Name]);
            }
          }
        }
      })
    ]
  ),
  apis: {
    getField1: (component: AlloyComponent) => AlloyParts.getPart(component, detail, 'field1'),
    getField2: (component: AlloyComponent) => AlloyParts.getPart(component, detail, 'field2'),
    getLock: (component: AlloyComponent) => AlloyParts.getPart(component, detail, 'lock')
  }
});

const FormCoupledInputs: FormCoupledInputsSketcher = Sketcher.composite<FormCoupledInputsSpec, FormCoupledInputsDetail, FormCoupledInputsApis>({
  name: 'FormCoupledInputs',
  configFields: FormCoupledInputsSchema.schema(),
  partFields: FormCoupledInputsSchema.parts(),
  factory,
  apis: {
    getField1: (apis, component) => apis.getField1(component),
    getField2: (apis, component) => apis.getField2(component),
    getLock: (apis, component) => apis.getLock(component)
  }
});

export {
  FormCoupledInputs
};
