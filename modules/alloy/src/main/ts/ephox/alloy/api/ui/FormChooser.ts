import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, SelectorFilter } from '@ephox/sugar';

import * as FormChooserSchema from '../../ui/schema/FormChooserSchema';
import { FormChooserDetail, FormChooserSketcher, FormChooserSpec } from '../../ui/types/FormChooserTypes';
import { Composing } from '../behaviour/Composing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Representing } from '../behaviour/Representing';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import * as AlloyEvents from '../events/AlloyEvents';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<FormChooserDetail, FormChooserSpec> = (detail, components: AlloySpec[], _spec, _externals): SketchSpec => {
  const findByValue = (chooser: AlloyComponent, value: any) => {
    const choices = SelectorFilter.descendants(chooser.element, '.' + detail.markers.choiceClass);
    const choiceComps = Arr.map(choices, (c) => chooser.getSystem().getByDom(c).getOrDie());

    return Arr.find(choiceComps, (c) => Representing.getValue(c) === value);
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    behaviours: SketchBehaviours.augment(
      detail.chooserBehaviours,
      [
        Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers.choiceClass,
          executeOnMove: true,
          getInitial: (chooser) => {
            return Highlighting.getHighlighted(chooser).map((choice) => choice.element);
          },
          // TODO CLEANUP: See if this execute handler can be removed, because execute is handled by bubbling to formchooser root
          execute: (chooser, simulatedEvent, focused) => {
            return chooser.getSystem().getByDom(focused).map((choice) => {
              Highlighting.highlight(chooser, choice);
              return true;
            }).toOptional().map<boolean>(Fun.always);
          }
        }),

        Highlighting.config({
          itemClass: detail.markers.choiceClass,
          highlightClass: detail.markers.selectedClass,
          onHighlight: (chooser, choice) => {
            Attribute.set(choice.element, 'aria-checked', 'true');
          },
          onDehighlight: (chooser, choice) => {
            Attribute.set(choice.element, 'aria-checked', 'false');
          }
        }),

        Composing.config({
          find: Optional.some
        }),

        Representing.config({
          store: {
            mode: 'manual',
            setValue: (chooser, value) => {
              findByValue(chooser, value).each((choiceWithValue) => {
                Highlighting.highlight(chooser, choiceWithValue);
              });
            },
            getValue: (chooser) => {
              return Highlighting.getHighlighted(chooser).map(Representing.getValue);
            }
          }
        })
      ]
    ),

    events: AlloyEvents.derive([
      AlloyEvents.runWithTarget(SystemEvents.execute(), Highlighting.highlight),
      AlloyEvents.runOnAttached(Highlighting.highlightFirst)
    ])
    // TODO: Add support for eventOrder
  };
};

const FormChooser: FormChooserSketcher = Sketcher.composite({
  name: 'FormChooser',
  configFields: FormChooserSchema.schema(),
  partFields: FormChooserSchema.parts(),
  factory
});

export {
  FormChooser
};
