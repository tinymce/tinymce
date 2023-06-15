import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

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
import { TieredMenuSpec } from '../types/TieredMenuTypes';
import { TypeaheadData, TypeaheadDetail } from '../types/TypeaheadTypes';

const schema = Fun.constant([
  FieldSchema.option('lazySink'),
  FieldSchema.required('fetch'),
  FieldSchema.defaulted('minChars', 5),
  FieldSchema.defaulted('responseTime', 1000),
  Fields.onHandler('onOpen'),
  // TODO: Remove dupe with Dropdown
  FieldSchema.defaulted('getHotspot', Optional.some),
  FieldSchema.defaulted('getAnchorOverrides', Fun.constant({ })),
  FieldSchema.defaulted('layouts', Optional.none()),
  FieldSchema.defaulted('eventOrder', { }),

  // Information about what these model settings do can be found in TypeaheadTypes
  FieldSchema.defaultedObjOf('model', { }, [
    FieldSchema.defaulted('getDisplayText', (itemData: TypeaheadData) => itemData.meta !== undefined && itemData.meta.text !== undefined ? itemData.meta.text : itemData.value),
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

  FieldSchema.customField('lazyTypeaheadComp', () => Cell(Optional.none)),

  FieldSchema.customField('previewing', () => Cell(true))
].concat(
  InputBase.schema()
).concat(
  SketcherFields.sandboxFields()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.external<TypeaheadDetail, TieredMenuSpec>({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    overrides: (detail) => {
      return {
        fakeFocus: true,
        onHighlightItem: (_tmenu: AlloyComponent, menu: AlloyComponent, item: AlloyComponent): void => {
          if (!detail.previewing.get()) {
            // We need to use this type of reference, rather than just looking
            // it up from the system by uid, because the input and the tieredmenu
            // might be in different systems.
            detail.lazyTypeaheadComp.get().each((input) => {
              if (detail.model.populateFromBrowse) {
                setValueFromItem(detail.model, input, item);
              }

              // The focus is retained on the input element when the menu is shown, unlike the combobox, in which the focus is passed to the menu.
              // This results in screen readers not being able to announce the menu or highlighted item.
              // The solution is to tell screen readers which menu item is highlighted using the `aria-activedescendant` attribute.
              // TINY-9280: The aria attribute is removed when the menu is closed.
              // Since `onDehighlight` is called only when highlighting a new menu item, this will be handled in
              // https://github.com/tinymce/tinymce/blob/2d8c1c034e8aa484b868a0c44605489ee0ca9cd4/modules/alloy/src/main/ts/ephox/alloy/ui/composite/TypeaheadSpec.ts#L282
              Attribute.getOpt(item.element, 'id').each((id) => Attribute.set(input.element, 'aria-activedescendant', id));
            });
          } else {
            // ASSUMPTION: Currently, any interaction with the menu via the keyboard or the mouse
            // will firstly clear previewing mode before triggering any highlights
            // so if we are still in previewing mode by the time we get to the highlight call,
            // that means that the highlight was triggered NOT by the user interacting
            // with the menu, but instead by the Highlighting API call that happens automatically
            // when a streamed keyboard input event is updating its results. That call will
            // try to keep any active highlight if there already was one (defaulting to first
            // if it can't find the original), but if there wasn't an active highlight, but
            // it is using "selectsOver", it will just highlight the first item. In this
            // latter case, it is only doing that so that selectsOver has something to copy.
            // So all of the complex code below is trying to handle whether we should stay
            // in previewing mode after this highlight, and the ONLY case where we should stay
            // in previewing mode is that we were in previewing mode, we are using selectsOver,
            // and the selectsOver failed to succeed. In that case, to stay in previewing mode,
            // we want to cancel the highlight that we just made via the highlighting API
            // and reset previewing to true. Otherwise, all codepaths should set previewing
            // to false, because now we have a valid highlight.
            //
            // As of 2022-08-18, the selectsOver model is not in use by TinyMCE, so
            // this subtle interaction is unfortunately largely untested. Also, if we can't
            // get a reference to the typeahead input by lazyTypeaheadComp, then we don't
            // change previewing, either. Note also, that it is likely that if we checked
            // if selectsOver would succeed before setting the highlight in the streaming
            // response, this could might be a lot easier to follow.
            detail.lazyTypeaheadComp.get().each((input) => {
              attemptSelectOver(detail.model, input, item).fold(
                // If we are in "previewing" mode and we can't select over the
                // thing that is first, then clear the highlight.
                // Hopefully, this doesn't cause a flicker. Find a better
                // way to do this.
                () => {
                  // If using "selectOver", we essentially want to cancel the highlight
                  // that was only invoked just so that we'd have something to selectOver,
                  // so we dehighlight, and then, importantly, *DON'T* clear previewing.
                  // We'll set it to be true to be explicit, although it should
                  // always be true if it reached here (unless an above function changed
                  // it)
                  if (detail.model.selectsOver) {
                    Highlighting.dehighlight(menu, item);
                    detail.previewing.set(true);
                  } else {
                    // Because we aren't using selectsOver mode, we now want to keep
                    // whatever highlight we just made, and because we have a highlighted
                    // item in the menu, we are no longer previewing.
                    detail.previewing.set(false);
                  }
                },
                ((selectOverTextInInput: () => void) => {
                  // We have made a selection in the menu, and have selected over text
                  // in the input, so clear previewing.
                  selectOverTextInInput();
                  detail.previewing.set(false);
                })
              );
            });
          }
        },

        // Because the focus stays inside the input, this onExecute is fired when the
        // user "clicks" on an item. The focusing behaviour should be configured
        // so that items don't get focus, but they prevent a mousedown event from
        // firing so that the typeahead doesn't lose focus. This is the handler
        // for clicking on an item. We need to close the sandbox, update the typeahead
        // to show the item clicked on, and fire an execute.
        onExecute: (_menu: AlloyComponent, item: AlloyComponent): Optional<boolean> => {
          // Note: This will only work when the typeahead and menu are in the same system.
          return detail.lazyTypeaheadComp.get().map((typeahead): boolean => {
            AlloyTriggers.emitWith(typeahead, TypeaheadEvents.itemExecute(), { item });
            return true;
          });
        },

        onHover: (menu: AlloyComponent, item: AlloyComponent): void => {
          // Hovering is also a user-initiated action, so previewing mode is over.
          // TODO: Have a better API for managing state in between parts.
          detail.previewing.set(false);
          detail.lazyTypeaheadComp.get().each((input) => {
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
