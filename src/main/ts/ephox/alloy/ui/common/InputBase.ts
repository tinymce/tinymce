import { FieldProcessorAdt, FieldSchema, Objects } from '@ephox/boulder';
import { Fun, Merger } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import { InputDetail } from '../../ui/types/InputTypes';
import { RawDomSchema } from '../../api/component/SpecTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.option('data'),
  FieldSchema.defaulted('inputAttributes', { }),
  FieldSchema.defaulted('inputStyles', { }),
  FieldSchema.defaulted('type', 'input'),
  FieldSchema.defaulted('tag', 'input'),
  FieldSchema.defaulted('inputClasses', [ ]),
  Fields.onHandler('onSetValue'),
  FieldSchema.defaulted('styles', { }),
  FieldSchema.option('placeholder'),
  FieldSchema.defaulted('eventOrder', { }),
  SketchBehaviours.field('inputBehaviours', [ Representing, Focusing ]),
  FieldSchema.defaulted('selectOnFocus', true)
]);

const focusBehaviours = <V>(detail: InputDetail<V>): Behaviour.AlloyBehaviourRecord => {
  return Behaviour.derive([
    Focusing.config({
      onFocus: detail.selectOnFocus() === false ? Fun.noop : (component) => {
        const input = component.element();
        const value = Value.get(input);
        input.dom().setSelectionRange(0, value.length);
      }
    })
  ]);
};

const behaviours = <V>(detail: InputDetail<V>): Behaviour.AlloyBehaviourRecord => {
  return Merger.deepMerge(
    Behaviour.derive([
      Representing.config({
        store: {
          mode: 'manual',
          // Propagating its Option
          initialValue: detail.data().getOr(undefined),
          getValue (input) {
            return Value.get(input.element());
          },
          setValue (input, data) {
            const current = Value.get(input.element());
            // Only set it if it has changed ... otherwise the cursor goes to the end.
            if (current !== data) {
              Value.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      })
    ]),
    focusBehaviours(detail),
    SketchBehaviours.get(detail.inputBehaviours())
  );
};

const dom = <V>(detail: InputDetail<V>): RawDomSchema => {
  return {
    tag: detail.tag(),
    attributes: Merger.deepMerge(
      Objects.wrapAll([
        {
          key: 'type',
          value: detail.type()
        }
      ].concat(detail.placeholder().map((pc) => {
        return {
          key: 'placeholder',
          value: pc
        };
      }).toArray())),
      detail.inputAttributes()
    ),
    styles: detail.inputStyles(),
    classes: detail.inputClasses()
  };
};

export {
  schema,
  behaviours,
  focusBehaviours,
  dom
};