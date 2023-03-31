import { FieldSchema, Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import { HtmlSelectDetail, HtmlSelectSketcher, HtmlSelectSpec } from '../../ui/types/HtmlSelectTypes';
import { Focusing } from '../behaviour/Focusing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { SketchSpec } from '../component/SpecTypes';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<HtmlSelectDetail, HtmlSelectSpec> = (detail, _spec): SketchSpec => {
  const options = Arr.map(detail.options, (option) => ({
    dom: {
      tag: 'option',
      value: option.value,
      innerHtml: option.text
    }
  }));

  const initialValues = detail.data.map((v) => Objects.wrap('initialValue', v)).getOr({ });

  return {
    uid: detail.uid,
    dom: {
      tag: 'select',
      classes: detail.selectClasses,
      attributes: detail.selectAttributes
    },
    components: options,
    behaviours: SketchBehaviours.augment(
      detail.selectBehaviours,
      [
        Focusing.config({ }),
        Representing.config({
          store: {
            mode: 'manual',
            getValue: (select) => {
              return Value.get(select.element);
            },
            setValue: (select, newValue) => {
              const firstOption = Arr.head(detail.options);
              // This is probably generically useful ... may become a part of Representing.
              const found = Arr.find(detail.options, (opt) => opt.value === newValue);
              if (found.isSome()) {
                Value.set(select.element, newValue);
              } else if (select.element.dom.selectedIndex === -1 && newValue === '') {
                /*
                  Sometimes after a redial alloy tries to set a new value, but if no value has been set in the data this used to fail. Now we set the value to the first option in the list if:
                    The index is out of range, indicating that the list of options have changed, or was never set.
                    The user is not trying to set a specific value (which would be user error)
                */
                firstOption.each((value) =>
                  Value.set(select.element, value.value)
                );
              }
            },
            ...initialValues
          }
        })
      ]
    )
  };
};

const HtmlSelect: HtmlSelectSketcher = Sketcher.single({
  name: 'HtmlSelect',
  configFields: [
    FieldSchema.required('options'),
    SketchBehaviours.field('selectBehaviours', [ Focusing, Representing ]),
    FieldSchema.defaulted('selectClasses', [ ]),
    FieldSchema.defaulted('selectAttributes', { }),
    FieldSchema.option('data')
  ],
  factory
});

export {
  HtmlSelect
};
