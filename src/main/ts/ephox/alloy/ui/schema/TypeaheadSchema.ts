import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import { attemptSelectOver, setValueFromItem } from '../../ui/typeahead/TypeaheadModel';

import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Sandboxing } from '../../api/behaviour/Sandboxing';
import { Streaming } from '../../api/behaviour/Streaming';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { TypeaheadData, TypeaheadDetail } from '../../ui/types/TypeaheadTypes';
import * as InputBase from '../common/InputBase';
import { Highlighting } from '../../api/behaviour/Highlighting';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.option('lazySink'),
  FieldSchema.strict('fetch'),
  FieldSchema.defaulted('minChars', 5),
  FieldSchema.defaulted('sandboxClasses', [ ]),
  Fields.onHandler('onOpen'),
  FieldSchema.defaulted('eventOrder', { }),
  FieldSchema.defaultedObjOf('model', { }, [
    FieldSchema.defaulted('getDisplayText', (itemData) => itemData.text),
    FieldSchema.defaulted('selectsOver', true)
  ]),

  Fields.onKeyboardHandler('onExecute'),
  FieldSchema.defaulted('inputClasses', [ ]),
  FieldSchema.defaulted('inputAttributes', { }),
  FieldSchema.defaulted('inputStyles', { }),
  FieldSchema.defaulted('matchWidth', true),
  FieldSchema.defaulted('dismissOnBlur', true),
  Fields.markers([ 'openClass' ]),

  SketchBehaviours.field('typeaheadBehaviours', [
    Focusing, Representing, Streaming, Keying, Toggling, Coupling
  ]),

  FieldSchema.defaulted('dataset', [ ]),

  FieldSchema.state('previewing', () => {
    return Cell(true);
  })
].concat(
  InputBase.schema()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    overrides (detail: TypeaheadDetail) {
      return {
        fakeFocus: true,
        onHighlight (menu: AlloyComponent, item: AlloyComponent): void {
          if (! detail.previewing().get()) {
            menu.getSystem().getByUid(detail.uid()).each((input) => {
              setValueFromItem(detail.model(), input, item);
            });
          } else {
            // Highlight the rest of the text so that the user types over it.
            menu.getSystem().getByUid(detail.uid()).each((input) => {
              attemptSelectOver(detail.model(), input, item).fold(
                // If we are in "previewing" mode, and we can't select over the
                // thing that is first, then clear the highlight
                // Hopefully, this doesn't cause a flicker. Find a better
                // way to do this.
                () => Highlighting.dehighlight(menu, item),
                ((fn) => fn())
              )
            });
          }
          detail.previewing().set(false);
        },
        onExecute (menu: AlloyComponent, item: AlloyComponent): Option<boolean> {
          return menu.getSystem().getByUid(detail.uid()).toOption().bind((typeahead) => {
            const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
            const system = item.getSystem();
            // Closing the sandbox takes the item out of the system, so keep a reference.
            Sandboxing.close(sandbox);
            return system.getByUid(detail.uid()).toOption().bind((input) => {
              setValueFromItem(detail.model(),input, item);

              const currentValue: TypeaheadData = Representing.getValue(input);
              detail.onExecute()(sandbox, input, currentValue);
              return Option.some(true);
            });
          });
        },

        onHover (menu: AlloyComponent, item: AlloyComponent): void {
          menu.getSystem().getByUid(detail.uid()).each((input) => {
            setValueFromItem(detail.model(), input, item);
          });
        }
      };
    }
  })
]);

const name = Fun.constant('Typeahead');

export {
  name,
  schema,
  parts
};