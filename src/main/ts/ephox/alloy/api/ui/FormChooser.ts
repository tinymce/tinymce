import { Arr, Merger, Option } from '@ephox/katamari';
import { Attr, SelectorFilter } from '@ephox/sugar';

import * as FormChooserSchema from '../../ui/schema/FormChooserSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {
  const findByValue = function (chooser, value) {
    const choices = SelectorFilter.descendants(chooser.element(), '.' + detail.markers().choiceClass());
    const choiceComps = Arr.map(choices, function (c) {
      return chooser.getSystem().getByDom(c).getOrDie();
    });

    return Arr.find(choiceComps, function (c) {
      return Representing.getValue(c) === value;
    });
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components,

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().choiceClass(),
          executeOnMove: true,
          getInitial (chooser) {
            return Highlighting.getHighlighted(chooser).map(function (choice) {
              return choice.element();
            });
          },
          execute (chooser, simulatedEvent, focused) {
            return chooser.getSystem().getByDom(focused).map(function (choice) {
              Highlighting.highlight(chooser, choice);
              return true;
            });
          }
        }),

        Highlighting.config({
          itemClass: detail.markers().choiceClass(),
          highlightClass: detail.markers().selectedClass(),
          onHighlight (chooser, choice) {
            Attr.set(choice.element(), 'aria-checked', 'true');
          },
          onDehighlight (chooser, choice) {
            Attr.set(choice.element(), 'aria-checked', 'false');
          }
        }),

        Composing.config({
          find: Option.some
        }),

        Representing.config({
          store: {
            mode: 'manual',
            setValue (chooser, value) {
              findByValue(chooser, value).each(function (choiceWithValue) {
                Highlighting.highlight(chooser, choiceWithValue);
              });
            },
            getValue (chooser) {
              return Highlighting.getHighlighted(chooser).map(Representing.getValue);
            }
          }
        })
      ]),
      SketchBehaviours.get(detail.chooserBehaviours())
    ),

    events: AlloyEvents.derive([
      AlloyEvents.runWithTarget(SystemEvents.execute(), Highlighting.highlight),
      AlloyEvents.runOnAttached(Highlighting.highlightFirst)
    ])
  };
};

export default <any> Sketcher.composite({
  name: 'FormChooser',
  configFields: FormChooserSchema.schema(),
  partFields: FormChooserSchema.parts(),
  factory
});