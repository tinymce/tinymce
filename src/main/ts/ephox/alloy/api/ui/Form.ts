import { Arr, Merger, Obj, Option } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as GuiTypes from './GuiTypes';
import * as UiSketcher from './UiSketcher';
import { SketchSpec } from 'ephox/alloy/api/ui/Sketcher';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const owner = 'form';

export interface FormSketch {
  // why do forms not use the SingleSketch Type?
  sketch: (spec) => SketchSpec;
  getField: (component: AlloyComponent, key: string) => Option<AlloyComponent>;
}

const schema = [
  SketchBehaviours.field('formBehaviours', [ Representing ])
];

const getPartName = function (name) {
  return '<alloy.field.' + name + '>';
};

const sketch = function (fSpec) {
  const parts = (function () {
    const record = [ ];

    const field = function (name, config) {
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
  const fieldParts = Arr.map(partNames, function (n) {
    return PartType.required({ name: n, pname: getPartName(n) });
  });

  return UiSketcher.composite(owner, schema, fieldParts, make, spec);
};

const make = function (detail, components, spec) {
  return Merger.deepMerge(
    {
      'debug.sketcher': {
        Form: spec
      },
      'uid': detail.uid(),
      'dom': detail.dom(),
      'components': components,

      // Form has an assumption that every field must have composing, and that the composed element has representing.
      'behaviours': Merger.deepMerge(
        Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue (form) {
                const optPs = AlloyParts.getAllParts(form, detail);
                return Obj.map(optPs, function (optPThunk, pName) {
                  return optPThunk().bind(Composing.getCurrent).map(Representing.getValue);
                });
              },
              setValue (form, values) {
                Obj.each(values, function (newValue, key) {
                  AlloyParts.getPart(form, detail, key).each(function (wrapper) {
                    Composing.getCurrent(wrapper).each(function (field) {
                      Representing.setValue(field, newValue);
                    });
                  });
                });
              }
            }
          })
        ]),
        SketchBehaviours.get(detail.formBehaviours())
      ),

      'apis': {
        getField (form, key) {
          // Returns an Option (not a result);
          return AlloyParts.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    }
  );
};

const Form = {
  getField: GuiTypes.makeApi(function (apis, component, key) {
    return apis.getField(component, key);
  }),
  sketch
} as FormSketch;

export {
  Form
};