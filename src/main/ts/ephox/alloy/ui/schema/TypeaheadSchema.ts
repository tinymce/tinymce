import Strings from '../../alien/Strings';
import Coupling from '../../api/behaviour/Coupling';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import Sandboxing from '../../api/behaviour/Sandboxing';
import Streaming from '../../api/behaviour/Streaming';
import Toggling from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import InputBase from '../common/InputBase';
import { FieldSchema } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var schema = [
  FieldSchema.option('lazySink'),
  FieldSchema.strict('fetch'),
  FieldSchema.defaulted('minChars', 5),
  Fields.onHandler('onOpen'),

  Fields.onKeyboardHandler('onExecute'),
  FieldSchema.defaulted('matchWidth', true),
  FieldSchema.defaulted('dismissOnBlur', true),
  Fields.markers([ 'openClass' ]),

  SketchBehaviours.field('typeaheadBehaviours', [
    Focusing, Representing, Streaming, Keying, Toggling, Coupling
  ]),

  FieldSchema.state('previewing', function () {
    return Cell(true);
  })
].concat(
  InputBase.schema()
);

var partTypes = [
  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    overrides: function (detail) {
      return {
        fakeFocus: true,
        onHighlight: function (menu, item) {
          if (! detail.previewing().get()) {
            menu.getSystem().getByUid(detail.uid()).each(function (input) {
              Representing.setValueFrom(input, item);
            });
          } else {
            // Highlight the rest of the text so that the user types over it.
            menu.getSystem().getByUid(detail.uid()).each(function (input) {
              var currentValue = Representing.getValue(input).text;
              var nextValue = Representing.getValue(item);
              if (Strings.startsWith(nextValue.text, currentValue)) {
                Representing.setValue(input, nextValue);
                input.element().dom().setSelectionRange(currentValue.length, nextValue.text.length);
              }

            });
          }
          detail.previewing().set(false);
        },
        onExecute: function (menu, item) {
          return menu.getSystem().getByUid(detail.uid()).bind(function (typeahead) {
            var sandbox = Coupling.getCoupled(typeahead, 'sandbox');
            var system = item.getSystem();
            // Closing the sandbox takes the item out of the system, so keep a reference.
            Sandboxing.close(sandbox);
            return system.getByUid(detail.uid()).bind(function (input) {
              Representing.setValueFrom(input, item);
              var currentValue = Representing.getValue(input);
              input.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
              // Should probably streamline this one.
              detail.onExecute()(sandbox, input);
              return Option.some(true);
            });
          });
        },

        onHover: function (menu, item) {
          menu.getSystem().getByUid(detail.uid()).each(function (input) {
            Representing.setValueFrom(input, item);
          });
        }
      };
    }
  })
];

export default <any> {
  name: Fun.constant('Typeahead'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};