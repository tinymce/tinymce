import { FieldSchema, Objects } from '@ephox/boulder';
import { Arr, Merger } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SketchSpec } from '../../api/component/SpecTypes';
import { HtmlSelectSketcher, HtmlSelectDetail, HtmlSelectSpec } from '../../ui/types/HtmlSelectTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';

const factory: SingleSketchFactory<HtmlSelectDetail, HtmlSelectSpec> = function (detail, spec): SketchSpec {
  const options = Arr.map(detail.options(), function (option) {
    return {
      dom: {
        tag: 'option',
        value: option.value,
        innerHtml: option.text
      }
    };
  });

  const initialValues = detail.data().map(function (v) {
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
                getValue (select) {
                  return Value.get(select.element());
                },
                setValue (select, newValue) {
                  // This is probably generically useful ... may become a part of Representing.
                  const found = Arr.find(detail.options(), function (opt) {
                    return opt.value === newValue;
                  });
                  if (found.isSome()) { Value.set(select.element(), newValue); }
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

const HtmlSelect = Sketcher.single({
  name: 'HtmlSelect',
  configFields: [
    FieldSchema.strict('options'),
    SketchBehaviours.field('selectBehaviours', [ Focusing, Representing ]),
    FieldSchema.option('data')
  ],
  factory
}) as HtmlSelectSketcher;

export {
  HtmlSelect
};