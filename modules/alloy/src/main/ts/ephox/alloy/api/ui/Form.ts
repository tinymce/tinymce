import { Arr, Obj, Option, Result } from '@ephox/katamari';

import { SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import { FormSpecBuilder, FormDetail, FormSketcher } from '../../ui/types/FormTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';
import { AlloyComponent } from '../../api/component/ComponentApi';

const owner = 'form';

const schema = [
  SketchBehaviours.field('formBehaviours', [ Representing ])
];

const getPartName = (name: string): string => {
  return '<alloy.field.' + name + '>';
};

const sketch = (fSpec: FormSpecBuilder): SketchSpec => {
  const parts = (() => {
    const record: string[] = [ ];

    const field = (name: string, config: any): AlloyParts.ConfiguredPart => {
      record.push(name);
      return AlloyParts.generateOne(owner, getPartName(name), config);
    };

    return {
      field,
      record () { return record; }
    };
  })();

  const spec = fSpec(parts);

  const partNames = parts.record();
  // Unlike other sketches, a form does not know its parts in advance (as they represent each field
  // in a particular form). Therefore, it needs to calculate the part names on the fly
  const fieldParts = Arr.map(partNames, (n) => {
    return PartType.required({ name: n, pname: getPartName(n) });
  });

  return UiSketcher.composite(owner, schema, fieldParts, make, spec);
};

const toResult = <T, E>(o: Option<T>, e: E) => o.fold(() => Result.error(e), Result.value);

const make = (detail: FormDetail, components, spec) => {
  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    // Form has an assumption that every field must have composing, and that the composed element has representing.
    behaviours: SketchBehaviours.augment(
      detail.formBehaviours,
      [
        Representing.config({
          store: {
            mode: 'manual',
            getValue (form) {
              const resPs = AlloyParts.getAllParts(form, detail);
              return Obj.map(resPs, (resPThunk, pName) => {
                return resPThunk().bind((v) => {
                  const opt = Composing.getCurrent(v);
                  return toResult(opt, 'missing current');
                }).map(Representing.getValue);
              });
            },
            setValue (form, values) {
              Obj.each(values, (newValue, key) => {
                AlloyParts.getPart(form, detail, key).each((wrapper) => {
                  Composing.getCurrent(wrapper).each((field) => {
                    Representing.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })
      ]
    ),

    apis: {
      getField (form: AlloyComponent, key: string) {
        // Returns an Option (not a result);
        return AlloyParts.getPart(form, detail, key).bind(Composing.getCurrent);
      }
    }
  };
};

const Form = {
  getField: GuiTypes.makeApi((apis, component: AlloyComponent, key: string) => {
    return apis.getField(component, key);
  }),
  sketch
} as FormSketcher;

export {
  Form
};
