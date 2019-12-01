import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Option } from '@ephox/katamari';
import { EventArgs, Focus, Value } from '@ephox/sugar';

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
import { TieredData } from '../../ui/types/TieredMenuTypes';
import { TypeaheadData, TypeaheadDetail, TypeaheadSpec } from '../../ui/types/TypeaheadTypes';
import * as InputBase from '../common/InputBase';
import * as TypeaheadEvents from './TypeaheadEvents';

interface ItemExecuteEvent extends CustomEvent {
  item: () => AlloyComponent;
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
          AlloyTriggers.dispatchEvent(sandbox, menu.element(), 'keydown', simulatedEvent);
        });
      });
    } else {
      const onOpenSync = (sandbox: AlloyComponent) => {
        Composing.getCurrent(sandbox).each(highlighter);
      };
      DropdownUtils.open(detail, mapFetch(comp), comp, sandbox, externals, onOpenSync, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
    }
  };

  // Due to the fact that typeahead probably need to separate value from text, they can't reuse
  // (easily) the same representing logic as input fields.
  const focusBehaviours = InputBase.focusBehaviours(detail);

  const mapFetch = (comp: AlloyComponent) => (tdata: Option<TieredData>): Option<TieredData> => {
    return tdata.map((data) => {
      const menus = Obj.values(data.menus);
      const items = Arr.bind(menus, (menu) => {
        return Arr.filter(menu.items, (item): item is NormalItemSpec => item.type === 'item');
      });

      const repState = Representing.getState(comp) as DatasetRepresentingState;
      repState.update(
        Arr.map(items, (item) => item.data)
      );
      return data;
    });
  };

  const behaviours = [
    Focusing.config({ }),
    Representing.config({
      onSetValue: detail.onSetValue,
      store: {
        mode: 'dataset',
        getDataKey: (comp) => Value.get(comp.element()),
        // This really needs to be configurable
        getFallbackEntry: (itemString) => ({
          value: itemString,
          meta: { }
        }),
        setValue: (comp, data) => {
          Value.set(comp.element(), detail.model.getDisplayText(data));
        },
        ...detail.initialData.map((d) => {
          return Objects.wrap('initialValue', d);
        }).getOr({ })
      }
    }),
    Streaming.config({
      stream: {
        mode: 'throttle',
        delay: detail.responseTime,
        stopEvent: false
      },
      onStream (component, simulatedEvent) {

        const sandbox = Coupling.getCoupled(component, 'sandbox');
        const focusInInput = Focusing.isFocused(component);
        // You don't want it to change when something else has triggered the change.
        if (focusInInput) {
          if (Value.get(component.element()).length >= detail.minChars) {

            const previousValue = Composing.getCurrent(sandbox).bind((menu) => {
              return Highlighting.getHighlighted(menu).map(Representing.getValue) as Option<TypeaheadData>;
            });

            detail.previewing.set(true);

            const onOpenSync = (_sandbox: AlloyComponent) => {
              Composing.getCurrent(sandbox).each((menu) => {
                previousValue.fold(() => {
                  if (detail.model.selectsOver) { Highlighting.highlightFirst(menu); }
                }, (pv) => {
                  Highlighting.highlightBy(menu, (item) => {
                    const itemData = Representing.getValue(item) as TypeaheadData;
                    return itemData.value === pv.value;
                  });

                  // Highlight first if could not find it?
                  Highlighting.getHighlighted(menu).orThunk(() => {
                    Highlighting.highlightFirst(menu);
                    return Option.none();
                  });
                });
              });
            };

            DropdownUtils.open(detail, mapFetch(component), component, sandbox, externals, onOpenSync, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
          }
        }
      },
      cancelEvent: SystemEvents.typeaheadCancel()
    }),

    Keying.config({
      mode: 'special',
      onDown (comp, simulatedEvent) {
        navigateList(comp, simulatedEvent, Highlighting.highlightFirst);
        return Option.some<boolean>(true);
      },
      onEscape (comp): Option<boolean> {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {
          Sandboxing.close(sandbox);
          return Option.some<boolean>(true);
        }
        return Option.none();
      },
      onUp (comp, simulatedEvent) {
        navigateList(comp, simulatedEvent, Highlighting.highlightLast);
        return Option.some<boolean>(true);
      },
      onEnter (comp) {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        const sandboxIsOpen = Sandboxing.isOpen(sandbox);

        // 'Previewing' means that items are shown but none has been actively selected by the user
        if (sandboxIsOpen && !detail.previewing.get()) {
          // If we have a current selection in the menu, and we aren't
          // previewing, copy the item data into the input
          return Composing.getCurrent(sandbox).bind((menu) => {
            return Highlighting.getHighlighted(menu);
          }).map((item): boolean => {
            AlloyTriggers.emitWith(comp, TypeaheadEvents.itemExecute(), { item });
            return true;
          });
        } else {
          const currentValue = Representing.getValue(comp) as TypeaheadData;
          AlloyTriggers.emit(comp, SystemEvents.typeaheadCancel());
          detail.onExecute(sandbox, comp, currentValue);

          // If we're open and previewing, close the sandbox after firing execute.
          if (sandboxIsOpen) {
            Sandboxing.close(sandbox);
          }
          return Option.some<boolean>(true);
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
        sandbox (hotspot) {
          return DropdownUtils.makeSandbox(detail, hotspot, {
            onOpen: () => Toggling.on(hotspot),
            onClose: () => Toggling.off(hotspot)
          });
        }
      }
    }),
    AddEventsBehaviour.config('typeaheadevents', [
      AlloyEvents.runOnExecute((comp) => {
        const onOpenSync = Fun.noop;
        DropdownUtils.togglePopup(detail, mapFetch(comp), comp, externals, onOpenSync, DropdownUtils.HighlightOnOpen.HighlightFirst).get(Fun.noop);
      }),
      AlloyEvents.run<ItemExecuteEvent>(TypeaheadEvents.itemExecute(), (comp, se) => {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');

        setValueFromItem(detail.model, comp, se.event().item());
        AlloyTriggers.emit(comp, SystemEvents.typeaheadCancel());
        detail.onItemExecute(comp, sandbox, se.event().item(), Representing.getValue(comp));

        Sandboxing.close(sandbox);
        setCursorAtEnd(comp);
      })
    ].concat(detail.dismissOnBlur ? [
      AlloyEvents.run(SystemEvents.postBlur(), (typeahead) => {
        const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
        // Only close the sandbox if the focus isn't inside it!
        if (Focus.search(sandbox.element()).isNone()) {
          Sandboxing.close(sandbox);
        }
      })
    ] : [ ]))
  ];

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
    eventOrder: detail.eventOrder
  };
};

export {
  make
};
