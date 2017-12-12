import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import GuiTypes from './GuiTypes';
import UiSketcher from './UiSketcher';
import AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var owner = 'form';

var schema = [
  SketchBehaviours.field('formBehaviours', [ Representing ])
];

var getPartName = function (name) {
  return '<alloy.field.' + name + '>';
};

var sketch = function (fSpec) {
  var parts = (function () {
    var record = [ ];

    var field = function (name, config) {
      record.push(name);
      return AlloyParts.generateOne(owner, getPartName(name), config);
    };

    return {
      field: field,
      record: function () { return record; }
    };
  })();

  var spec = fSpec(parts);

  var partNames = parts.record();
  // Unlike other sketches, a form does not know its parts in advance (as they represent each field
  // in a particular form). Therefore, it needs to calculate the part names on the fly
  var fieldParts = Arr.map(partNames, function (n) {
    return PartType.required({ name: n, pname: getPartName(n) });
  });

  return UiSketcher.composite(owner, schema, fieldParts, make, spec);
};

var make = function (detail, components, spec) {
  return Merger.deepMerge(
    {
      'debug.sketcher': {
        'Form': spec
      },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,

      // Form has an assumption that every field must have composing, and that the composed element has representing.
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (form) {
                var optPs = AlloyParts.getAllParts(form, detail);
                return Obj.map(optPs, function (optPThunk, pName) {
                  return optPThunk().bind(Composing.getCurrent).map(Representing.getValue);
                });
              },
              setValue: function (form, values) {
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

      apis: {
        getField: function (form, key) {
          // Returns an Option (not a result);
          return AlloyParts.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    }
  );
};

export default <any> {
  getField: GuiTypes.makeApi(function (apis, component, key) {
    return apis.getField(component, key);
  }),
  sketch: sketch
};