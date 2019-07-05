import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyParts from '../../parts/AlloyParts';
import * as FormCoupledInputsSchema from '../../ui/schema/FormCoupledInputsSchema';
import { FormCoupledInputsSketcher, FormCoupledInputsDetail, FormCoupledInputsSpec } from '../../ui/types/FormCoupledInputsTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import { SketchBehaviours } from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<FormCoupledInputsDetail, FormCoupledInputsSpec> = (detail, components, spec, externals): SketchSpec => {
  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    behaviours: SketchBehaviours.augment(
      detail.coupledFieldBehaviours,
      [
        Composing.config({ find: Option.some }),

        Representing.config({
          store: {
            mode: 'manual',
            getValue(comp) {

              const parts = AlloyParts.getPartsOrDie(comp, detail, ['field1', 'field2']);
              return {
                [detail.field1Name]: Representing.getValue(parts.field1()),
                [detail.field2Name]: Representing.getValue(parts.field2())
              };
            },
            setValue(comp, value) {
              const parts = AlloyParts.getPartsOrDie(comp, detail, ['field1', 'field2']);
              if (Objects.hasKey(value, detail.field1Name)) { Representing.setValue(parts.field1(), value[detail.field1Name]); }
              if (Objects.hasKey(value, detail.field2Name)) { Representing.setValue(parts.field2(), value[detail.field2Name]); }
            }
          }
        })
      ]
    ),
    apis: {
      getField1: (component) => AlloyParts.getPart(component, detail, 'field1'),
      getField2: (component) => AlloyParts.getPart(component, detail, 'field2'),
      getLock: (component) => AlloyParts.getPart(component, detail, 'lock')
    }
  };
};

const FormCoupledInputs = Sketcher.composite({
  name: 'FormCoupledInputs',
  configFields: FormCoupledInputsSchema.schema(),
  partFields: FormCoupledInputsSchema.parts(),
  factory,
  apis: {
    getField1: (apis, component) => apis.getField1(component),
    getField2: (apis, component) => apis.getField2(component),
    getLock: (apis, component) => apis.getLock(component)
  }
}) as FormCoupledInputsSketcher;

export {
  FormCoupledInputs
};
