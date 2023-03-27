import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Optional } from '@ephox/katamari';
import { Attribute, EventArgs, Focus, Value } from '@ephox/sugar';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Sandboxing } from '../../api/behaviour/Sandboxing';
import { Streaming } from '../../api/behaviour/Streaming';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { DatasetRepresentingState } from '../../behaviour/representing/RepresentingTypes';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import { CustomEvent, SimulatedEvent } from '../../events/SimulatedEvent';
import { setCursorAtEnd, setValueFromItem } from '../../ui/typeahead/TypeaheadModel';
import { NormalItemSpec } from '../../ui/types/ItemTypes';
import { HighlightOnOpen, TieredData } from '../../ui/types/TieredMenuTypes';
import { TypeaheadData, TypeaheadDetail, TypeaheadSpec } from '../../ui/types/TypeaheadTypes';
import * as InputBase from '../common/InputBase';
import * as TypeaheadEvents from './TypeaheadEvents';

interface ItemExecuteEvent extends CustomEvent {
  readonly item: AlloyComponent;
}

// TODO: Fix this.
const make: CompositeSketchFactory<TypeaheadDetail, TypeaheadSpec> = (detail, components, spec, externals) => {
  const navigateList = (
    comp: AlloyComponent,
    simulatedEvent: SimulatedEvent<EventArgs>,
    highlighter: (comp: AlloyComponent) => void
  ) => {
    /*
     * If we have an open Sandbox with an active menu,
     * but no highlighted item, then highlight the menu
     *
     * If we have an open Sandbox with an active menu,
     * and there is a highlighted item, simulated a keydown
     * on the menu
     *
     * If we have a closed sandbox, open the sandbox
     *
     * Regardless, this is a user initiated action. End previewing.
     */
    detail.previewing.set(false);
    const sandbox = Coupling.getCoupled(comp, 'sandbox');
    if (Sandboxing.isOpen(sandbox)) {
      Composing.getCurrent(sandbox).each((menu) => {
        Highlighting.getHighlighted(menu).fold(() => {
          highlighter(menu);
        }, () => {
          AlloyTriggers.dispatchEvent(sandbox, menu.element, 'keydown', simulatedEvent);
        });
      });
    } else {
      const onOpenSync = (sandbox: AlloyComponent) => {
        Composing.getCurrent(sandbox).each(highlighter);
      };
      DropdownUtils.open(detail, mapFetch(comp), comp, sandbox, externals, onOpenSync, HighlightOnOpen.HighlightMenuAndItem).get(Fun.noop);
    }
  };

  // Due to the fact that typeahead probably need to separate value from text, they can't reuse
  // (easily) the same representing logic as input fields.
  const focusBehaviours = InputBase.focusBehaviours(detail);

  const mapFetch = (comp: AlloyComponent) => (tdata: Optional<TieredData>): Optional<TieredData> => tdata.map((data) => {
    const menus = Obj.values(data.menus);
    const items = Arr.bind(menus, (menu) => Arr.filter(menu.items, (item): item is NormalItemSpec => item.type === 'item'));

    const repState = Representing.getState(comp) as DatasetRepresentingState;
    repState.update(
      Arr.map(items, (item) => item.data)
    );
    return data;
  });

  // This function (getActiveMenu) is intended to make it easier to read what is happening
  // without having to decipher the Highlighting and Composing calls.
  const getActiveMenu = (sandboxComp: AlloyComponent): Optional<AlloyComponent> =>
    Composing.getCurrent(sandboxComp);

  const typeaheadCustomEvents = 'typeaheadevents';

  const behaviours = [
    Focusing.config({ }),
    Representing.config({
      onSetValue: detail.onSetValue,
      store: {
        mode: 'dataset',
        getDataKey: (comp) => Value.get(comp.element),
        // This really needs to be configurable
        getFallbackEntry: (itemString) => ({
          value: itemString,
          meta: { }
        }),
        setValue: (comp, data) => {
          Value.set(comp.element, detail.model.getDisplayText(data));
        },
        ...detail.initialData.map((d) => Objects.wrap('initialValue', d)).getOr({ })
      }
    }),
    Streaming.config({
      stream: {
        mode: 'throttle',
        delay: detail.responseTime,
        stopEvent: false
      },
      onStream: (component, _simulatedEvent) => {

        const sandbox = Coupling.getCoupled(component, 'sandbox');
        const focusInInput = Focusing.isFocused(component);
        // You don't want it to change when something else has triggered the change.
        if (focusInInput) {
          if (Value.get(component.element).length >= detail.minChars) {

            // Get the value of the previously active (selected/highlighted) item. We
            // are going to try to preserve this.
            const previousValue = getActiveMenu(sandbox).bind((activeMenu) =>
              Highlighting.getHighlighted(activeMenu).map(Representing.getValue) as Optional<TypeaheadData>
            );

            // Turning previewing ON here every keystroke is unnecessary, but relies
            // on the fact that it will be turned off if required by highlighting events.
            // So even if previewing was supposed to be off, turning it on here is
            // just temporary, because the onOpenSync below will trigger a highlight
            // if there was meant to be one, which will turn it off if required.
            detail.previewing.set(true);

            const onOpenSync = (_sandbox: AlloyComponent) => {
              // This getActiveMenu relies on a menu being highlighted / active
              getActiveMenu(sandbox).each((activeMenu) => {
                // The folds can make this hard to follow, but the basic gist of it is
                // that we want to see if we need to highlight one of the items in the
                // menu that we just opened. If we do highlight an item, then that
                // highlighting action will clear previewing (handled by the TieredMenu
                // part configuration for onHighlight). Note: that onOpenSync runs
                // *after* the highlightOnOpen setting.
                //
                // 1. If in "selectsOver" mode and we don't have a previous item,
                // then highlight the first one. This one will be used as the basis
                // for the "selectsOver" text selection. The act of highlighting the
                // first item will take us out of previewing mode. If the "selectsOver"
                // operation fails, it should clear the highlight, and restore previewing
                // 2. If not in "selectsOver" mode, and we don't have a previous item,
                // then we don't highlight anything. This will keep us in previewing
                // mode until the menu is interacted with (hover, navigation etc.)
                // 3. If we have a previous item, then try and rehighlight it. But if
                // we can't, the just highlight the first. Either action will take us
                // out of previewing mode.
                previousValue.fold(() => {
                  // We are using "selectOver", so we need *something* to highlight
                  if (detail.model.selectsOver) {
                    Highlighting.highlightFirst(activeMenu);
                  }

                  // We aren't using "selectOver", so don't highlight anything
                  // to preserve our "previewing" mode.
                }, (pv) => {
                  // We have a previous item, so if we can't rehighlight it, then
                  // we'll change to the first item. We want to keep some selection.
                  Highlighting.highlightBy(activeMenu, (item) => {
                    const itemData = Representing.getValue(item) as TypeaheadData;
                    return itemData.value === pv.value;
                  });

                  // Highlight first if could not find it?
                  Highlighting.getHighlighted(activeMenu).orThunk(() => {
                    Highlighting.highlightFirst(activeMenu);
                    return Optional.none();
                  });
                });
              });
            };

            DropdownUtils.open(
              detail,
              mapFetch(component),
              component,
              sandbox,
              externals,
              onOpenSync,
              // The onOpenSync takes care of what should be given the highlights, but
              // we want to highlight just the menu so that the onOpenSync can find the
              // activeMenu.
              HighlightOnOpen.HighlightJustMenu
            ).get(Fun.noop);
          }
        }
      },
      cancelEvent: SystemEvents.typeaheadCancel()
    }),

    Keying.config({
      mode: 'special',
      onDown: (comp, simulatedEvent) => {
        // The navigation here will stop the "previewing" mode, because
        // now the menu will get focus (fake focus, but focus nevertheless)
        navigateList(comp, simulatedEvent, Highlighting.highlightFirst);
        return Optional.some<boolean>(true);
      },
      onEscape: (comp): Optional<boolean> => {
        // Escape only has handling if the sandbox is visible. It has no meaning
        // to the input itself.
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          Sandboxing.close(sandbox);
          return Optional.some<boolean>(true);
        }
        return Optional.none();
      },
      onUp: (comp, simulatedEvent) => {
        // The navigation here will stop the "previewing" mode, because
        // now the menu will get focus (fake focus, but focus nevertheless)
        navigateList(comp, simulatedEvent, Highlighting.highlightLast);
        return Optional.some<boolean>(true);
      },
      onEnter: (comp) => {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        const sandboxIsOpen = Sandboxing.isOpen(sandbox);

        // 'Previewing' means that items are shown but none has been actively selected by the user.
        // When previewing, all keyboard input should still be processed by the
        // input itself, not the menu. The menu is not considered to have focus.
        // 'Previewing' is turned on by (streaming) keystrokes, and turned off by
        // successful interaction with the menu (navigation, highlighting, hovering).

        // So if we aren't previewing, and the dropdown sandbox is open, then
        // we process <enter> keys on the items in the menu. All this will do
        // is trigger an itemExecute event. The typeahead events (in the spec below)
        // are responsible for doing something with that event.
        if (sandboxIsOpen && !detail.previewing.get()) {
          return getActiveMenu(sandbox).bind((activeMenu) =>
            Highlighting.getHighlighted(activeMenu)
          ).map((item) => {
            // And item was selected, so trigger execute and consider the
            // <enter> key 'handled'
            AlloyTriggers.emitWith(comp, TypeaheadEvents.itemExecute(), { item });
            return true;
          });
        } else {
          // We are either previewing, or the sandbox isn't open, so we should
          // process the <enter> key inside the input itself. This should cancel
          // any attempt to fetch data (the typeaheadCancel), and trigger the execute.
          // We also close the sandbox if it's open.
          const currentValue = Representing.getValue(comp) as TypeaheadData;
          AlloyTriggers.emit(comp, SystemEvents.typeaheadCancel());
          detail.onExecute(sandbox, comp, currentValue);

          // If we're open and previewing, close the sandbox after firing execute.
          if (sandboxIsOpen) {
            Sandboxing.close(sandbox);
          }
          return Optional.some<boolean>(true);
        }
      }
    }),

    Toggling.config({
      toggleClass: detail.markers.openClass,
      aria: {
        mode: 'expanded'
      }
    }),

    Coupling.config({
      others: {
        sandbox: (hotspot) => {
          return DropdownUtils.makeSandbox(detail, hotspot, {
            onOpen: () => Toggling.on(hotspot),
            onClose: () => {
              // TINY-9280: Remove aria-activedescendant that is set when menu item is highlighted
              detail.lazyTypeaheadComp.get().each((input) => Attribute.remove(input.element, 'aria-activedescendant'));
              Toggling.off(hotspot);
            }
          });
        }
      }
    }),
    AddEventsBehaviour.config(typeaheadCustomEvents, [
      AlloyEvents.runOnAttached((typeaheadComp) => {
        // Set up the reference to the typeahead, so that it can retrieved from
        // the tiered menu part, even if the tieredmenu is in a different
        // system / alloy root / mothership.
        detail.lazyTypeaheadComp.set(Optional.some(typeaheadComp));
      }),
      AlloyEvents.runOnDetached((_typeaheadComp) => {
        detail.lazyTypeaheadComp.set(Optional.none());
      }),
      AlloyEvents.runOnExecute((comp) => {
        const onOpenSync = Fun.noop;
        DropdownUtils.togglePopup(detail, mapFetch(comp), comp, externals, onOpenSync, HighlightOnOpen.HighlightMenuAndItem).get(Fun.noop);
      }),
      AlloyEvents.run<ItemExecuteEvent>(TypeaheadEvents.itemExecute(), (comp, se) => {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');

        // Copy the value from the executed item into the input, because it was "chosen"
        setValueFromItem(detail.model, comp, se.event.item);
        AlloyTriggers.emit(comp, SystemEvents.typeaheadCancel());
        detail.onItemExecute(comp, sandbox, se.event.item, Representing.getValue(comp));

        Sandboxing.close(sandbox);
        setCursorAtEnd(comp);
      })
    ].concat(detail.dismissOnBlur ? [
      AlloyEvents.run(SystemEvents.postBlur(), (typeahead) => {
        const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
        // Only close the sandbox if the focus isn't inside it!
        if (Focus.search(sandbox.element).isNone()) {
          Sandboxing.close(sandbox);
        }
      })
    ] : [ ]))
  ];

  // The order specified here isn't important. Alloy just requires a
  // deterministic order for the configured behaviours.
  const eventOrder = {
    [SystemEvents.detachedFromDom()]: [
      Representing.name(),
      Streaming.name(),
      typeaheadCustomEvents
    ],
    ...detail.eventOrder,
  };

  return {
    uid: detail.uid,
    dom: InputBase.dom(Merger.deepMerge(detail, {
      // TODO: Add aria-activedescendant attribute
      inputAttributes: {
        'role': 'combobox',
        'aria-autocomplete': 'list',
        'aria-haspopup': 'true'
      }
    })),
    behaviours: {
      ...focusBehaviours,
      ...SketchBehaviours.augment(
        detail.typeaheadBehaviours,
        behaviours
      )
    },
    eventOrder
  };
};

export {
  make
};
