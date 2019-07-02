import { FieldSchema, Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import { SketchSpec } from '../../api/component/SpecTypes';
import { HtmlSelectSketcher, HtmlSelectDetail, HtmlSelectSpec } from '../../ui/types/HtmlSelectTypes';
import { Focusing } from '../behaviour/Focusing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<HtmlSelectDetail, HtmlSelectSpec> = (detail, spec): SketchSpec => {
  const options = Arr.map(detail.options, (option) => {
    return {
      dom: {
        tag: 'option',
        value: option.value,
        innerHtml: option.text
      }
    };
  });

  const initialValues = detail.data.map((v) => {
    return Objects.wrap('initialValue', v);
  }).getOr({ });

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
            getValue (select) {
              return Value.get(select.element());
            },
            setValue (select, newValue) {
              // This is probably generically useful ... may become a part of Representing.
              const found = Arr.find(detail.options, (opt) => {
                return opt.value === newValue;
              });
              if (found.isSome()) { Value.set(select.element(), newValue); }
            },
            ...initialValues
          }
        })
      ]
    )
  };
};

const HtmlSelect = Sketcher.single({
  name: 'HtmlSelect',
  configFields: [
    FieldSchema.strict('options'),
    SketchBehaviours.field('selectBehaviours', [ Focusing, Representing ]),
    FieldSchema.defaulted('selectClasses', [ ]),
    FieldSchema.defaulted('selectAttributes', { }),
    FieldSchema.option('data')
  ],
  factory
}) as HtmlSelectSketcher;

export {
  HtmlSelect
};
