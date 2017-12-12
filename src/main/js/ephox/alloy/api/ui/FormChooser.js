import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Highlighting from '../behaviour/Highlighting';
import Keying from '../behaviour/Keying';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import AlloyEvents from '../events/AlloyEvents';
import SystemEvents from '../events/SystemEvents';
import Sketcher from './Sketcher';
import FormChooserSchema from '../../ui/schema/FormChooserSchema';
import { Arr } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';

var factory = function (detail, components, spec, externals) {
  var findByValue = function (chooser, value) {
    var choices = SelectorFilter.descendants(chooser.element(), '.' + detail.markers().choiceClass());
    var choiceComps = Arr.map(choices, function (c) {
      return chooser.getSystem().getByDom(c).getOrDie();
    });

    return Arr.find(choiceComps, function (c) {
      return Representing.getValue(c) === value;
    });
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: components,

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().choiceClass(),
          executeOnMove: true,
          getInitial: function (chooser) {
            return Highlighting.getHighlighted(chooser).map(function (choice) {
              return choice.element();
            });
          },
          execute: function (chooser, simulatedEvent, focused) {
            return chooser.getSystem().getByDom(focused).map(function (choice) {
              Highlighting.highlight(chooser, choice);
              return true;
            });
          }
        }),

        Highlighting.config({
          itemClass: detail.markers().choiceClass(),
          highlightClass: detail.markers().selectedClass(),
          onHighlight: function (chooser, choice) {
            Attr.set(choice.element(), 'aria-checked', 'true');
          },
          onDehighlight: function (chooser, choice) {
            Attr.set(choice.element(), 'aria-checked', 'false');
          }
        }),

        Composing.config({
          find: Option.some
        }),

        Representing.config({
          store: {
            mode: 'manual',
            setValue: function (chooser, value) {
              findByValue(chooser, value).each(function (choiceWithValue) {
                Highlighting.highlight(chooser, choiceWithValue);
              });
            },
            getValue: function (chooser) {
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
  factory: factory
});