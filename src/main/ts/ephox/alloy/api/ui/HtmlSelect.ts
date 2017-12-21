import Behaviour from '../behaviour/Behaviour';
import Focusing from '../behaviour/Focusing';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

var factory = function (detail, spec) {
  var options = Arr.map(detail.options(), function (option) {
    return {
      dom: {
        tag: 'option',
        value: option.value,
        innerHtml: option.text
      }
    };
  });

  var initialValues = detail.data().map(function (v) {
    return Objects.wrap('initialValue', v);
  }).getOr({ });

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: {
        tag: 'select'
      },
      components: options,
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Focusing.config({ }),
          Representing.config({
            store: Merger.deepMerge(
              {
                mode: 'manual',
                getValue: function (select) {
                  return Value.get(select.element());
                },
                setValue: function (select, newValue) {
                  // This is probably generically useful ... may become a part of Representing.
                  var found = Arr.find(detail.options(), function (opt) {
                    return opt.value === newValue;
                  });
                  if (found.isSome()) Value.set(select.element(), newValue);
                }
              },
              initialValues
            )
          })
        ]),
        SketchBehaviours.get(detail.selectBehaviours())
      )
    }
  );
};

export default <any> Sketcher.single({
  name: 'HtmlSelect',
  configFields: [
    FieldSchema.strict('options'),
    SketchBehaviours.field('selectBehaviours', [ Focusing, Representing ]),
    FieldSchema.option('data')
  ],
  factory: factory
});