import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';

import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Streaming } from '../../api/behaviour/Streaming';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as Fields from '../../data/Fields';
import * as SketcherFields from '../../data/SketcherFields';
import * as PartType from '../../parts/PartType';
import * as InputBase from '../common/InputBase';
import * as TypeaheadEvents from '../composite/TypeaheadEvents';
import { attemptSelectOver, setValueFromItem } from '../typeahead/TypeaheadModel';
import { TypeaheadDetail } from '../types/TypeaheadTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.option('lazySink'),
  FieldSchema.strict('fetch'),
  FieldSchema.defaulted('minChars', 5),
  FieldSchema.defaulted('responseTime', 1000),
  Fields.onHandler('onOpen'),
  // TODO: Remove dupe with Dropdown
  FieldSchema.defaulted('getHotspot', Option.some),
  FieldSchema.defaulted('getAnchorOverrides', Fun.constant({ })),
  FieldSchema.defaulted('layouts', Option.none()),
  FieldSchema.defaulted('eventOrder', { }),
  FieldSchema.defaultedObjOf('model', { }, [
    FieldSchema.defaulted('getDisplayText', (itemData) => itemData.meta !== undefined && itemData.meta.text !== undefined ? itemData.meta.text : itemData.value),
    FieldSchema.defaulted('selectsOver', true),
    FieldSchema.defaulted('populateFromBrowse', true)
  ]),

  Fields.onHandler('onSetValue'),
  Fields.onKeyboardHandler('onExecute'),
  Fields.onHandler('onItemExecute'),
  FieldSchema.defaulted('inputClasses', [ ]),
  FieldSchema.defaulted('inputAttributes', { }),
  FieldSchema.defaulted('inputStyles', { }),
  FieldSchema.defaulted('matchWidth', true),
  FieldSchema.defaulted('useMinWidth', false),
  FieldSchema.defaulted('dismissOnBlur', true),
  Fields.markers([ 'openClass' ]),
  FieldSchema.option('initialData'),

  SketchBehaviours.field('typeaheadBehaviours', [
    Focusing, Representing, Streaming, Keying, Toggling, Coupling
  ]),

  FieldSchema.state('previewing', () => {
    return Cell(true);
  })
].concat(
  InputBase.schema()
).concat(
  SketcherFields.sandboxFields()
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
          if (! detail.previewing.get()) {
            menu.getSystem().getByUid(detail.uid).each((input) => {

              if (detail.model.populateFromBrowse) {
                setValueFromItem(detail.model, input, item);
              }
            });
          } else {
            // Highlight the rest of the text so that the user types over it.
            menu.getSystem().getByUid(detail.uid).each((input) => {
              attemptSelectOver(detail.model, input, item).fold(
                // If we are in "previewing" mode, and we can't select over the
                // thing that is first, then clear the highlight
                // Hopefully, this doesn't cause a flicker. Find a better
                // way to do this.
                () => Highlighting.dehighlight(menu, item),
                ((fn) => fn())
              );
            });
          }
          detail.previewing.set(false);
        },

        // Because the focus stays inside the input, this onExecute is fired when the
        // user "clicks" on an item. The focusing behaviour should be configured
        // so that items don't get focus, but they prevent a mousedown event from
        // firing so that the typeahead doesn't lose focus. This is the handler
        // for clicking on an item. We need to close the sandbox, update the typeahead
        // to show the item clicked on, and fire an execute.
        onExecute (menu: AlloyComponent, item: AlloyComponent): Option<boolean> {
          // Note: This will only work when the typeahead and menu are in the same system.
          return menu.getSystem().getByUid(detail.uid).toOption().map((typeahead) => {
            AlloyTriggers.emitWith(typeahead, TypeaheadEvents.itemExecute(), { item });
            return true;
          });
        },

        onHover (menu: AlloyComponent, item: AlloyComponent): void {
          // Hovering is also a user-initiated action, so previewing mode is over.
          // TODO: Have a better API for managing state in between parts.
          detail.previewing.set(false);
          menu.getSystem().getByUid(detail.uid).each((input) => {
            if (detail.model.populateFromBrowse) {
              setValueFromItem(detail.model, input, item);
            }
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
