import { console } from '@ephox/dom-globals';
import { Arr, Fun, Merger, Obj, Option } from '@ephox/katamari';
import { Value, Focus } from '@ephox/sugar';
import { DatasetRepresentingState } from '../../behaviour/representing/RepresentState';

import * as Behaviour from '../../api/behaviour/Behaviour';
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
// TODO: Fix this.
import { SugarEvent, TieredData } from '../../api/Main';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import { SimulatedEvent } from '../../events/SimulatedEvent';
import { HotspotAnchorSpec } from '../../positioning/mode/Anchoring';
import { setCursorAtEnd, setValueFromItem } from '../../ui/typeahead/TypeaheadModel';
import { TypeaheadData, TypeaheadDetail, TypeaheadSpec } from '../../ui/types/TypeaheadTypes';
import * as InputBase from '../common/InputBase';
import { NormalItemSpec } from '../../ui/types/ItemTypes';

const make: CompositeSketchFactory<TypeaheadDetail, TypeaheadSpec> = (detail, components, spec, externals) => {
  const navigateList = (
    comp: AlloyComponent,
    simulatedEvent: SimulatedEvent<SugarEvent>,
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
    detail.previewing().set(false);
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
      const anchor: HotspotAnchorSpec = { anchor: 'hotspot', hotspot: comp };
      const onOpenSync = (sandbox) => {
        Composing.getCurrent(sandbox).each(highlighter);
      };
      DropdownUtils.open(detail, mapFetch(comp), anchor, comp, sandbox, externals, onOpenSync).get(Fun.noop);
    }
  };

  // Due to the fact that typeahead probably need to separate value from text, they can't reuse
  // (easily) the same representing logic as input fields.
  const focusBehaviours = InputBase.focusBehaviours(detail);

  const mapFetch = (comp: AlloyComponent) => (tdata: TieredData): TieredData => {
    const menus = Obj.values(tdata.menus);
    const items = Arr.bind(menus, (menu): NormalItemSpec[] => {
      return Arr.filter(menu.items, (item) => item.type === 'item');
    });

    const repState = Representing.getState(comp) as DatasetRepresentingState;
    repState.update(
      Arr.map(items, (item) => item.data)
    );
    return tdata;
  };

  const behaviours = Behaviour.derive([
    Focusing.config({ }),
    Representing.config({
      store: {
        mode: 'dataset',
        getDataKey: (comp) => Value.get(comp.element()),
        getFallbackEntry: (itemString) => ({
          value: itemString,
          text: itemString
        }),
        setValue: (comp, data) => {
          Value.set(comp.element(), detail.model().getDisplayText()(data));
        },
        initialValue: detail.data().getOr(''),
        initialDataset: detail.dataset()
      }
    }),
    Streaming.config({
      stream: {
        mode: 'throttle',
        delay: 1000
      },
      onStream (component, simulatedEvent) {

        const sandbox = Coupling.getCoupled(component, 'sandbox');
        const focusInInput = Focusing.isFocused(component);
        // You don't want it to change when something else has triggered the change.
        if (focusInInput) {
          if (Value.get(component.element()).length >= detail.minChars()) {

            const previousValue = Composing.getCurrent(sandbox).bind((menu) => {
              return Highlighting.getHighlighted(menu).map(Representing.getValue) as Option<TypeaheadData>;
            });

            detail.previewing().set(true);

            const onOpenSync = (_sandbox) => {
              Composing.getCurrent(sandbox).each((menu) => {
                previousValue.fold(() => {
                  if (detail.model().selectsOver()) { Highlighting.highlightFirst(menu); }
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

            const anchor: HotspotAnchorSpec = { anchor: 'hotspot', hotspot: component };
            DropdownUtils.open(detail, mapFetch(component), anchor, component, sandbox, externals, onOpenSync).get(Fun.noop);
          }
        }
      }
    }),

    Keying.config({
      mode: 'special',
      onDown (comp, simulatedEvent) {
        navigateList(comp, simulatedEvent, Highlighting.highlightFirst);
        return Option.some(true);
      },
      onEscape (comp) {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) { Sandboxing.close(sandbox); }
        return Option.some(true);
      },
      onUp (comp, simulatedEvent) {
        navigateList(comp, simulatedEvent, Highlighting.highlightLast);
        return Option.some(true);
      },
      onEnter (comp, simulatedEvent) {
        const sandbox = Coupling.getCoupled(comp, 'sandbox');
        if (Sandboxing.isOpen(sandbox)) {

          // If we have a current selection in the menu, and we aren't
          // previewing, copy the item data into the input
          Composing.getCurrent(sandbox).each((menu) => {
            Highlighting.getHighlighted(menu).each((item) => {
              if (detail.previewing().get() === false) {
                setValueFromItem(detail.model(), comp, item);
              }
            });
          });
          Sandboxing.close(sandbox);
        }
        const currentValue = Representing.getValue(comp) as TypeaheadData;

        detail.onExecute()(sandbox, comp, currentValue);
        setCursorAtEnd(comp);
        return Option.some(true);
      }
    }),

    Toggling.config({
      toggleClass: detail.markers().openClass(),
      aria: {
        // TODO: Maybe this should just be expanded?
        mode: 'pressed',
        syncWithExpanded: true
      }
    }),

    Coupling.config({
      others: {
        sandbox (hotspot) {
          return DropdownUtils.makeSandbox(detail, {
            anchor: 'hotspot',
            hotspot
          }, hotspot, {
            onOpen: Fun.identity,
            onClose: Fun.identity
          });
        }
      }
    })
  ]);

  return {
    uid: detail.uid(),
    dom: InputBase.dom(detail),
    behaviours: Merger.deepMerge(
      focusBehaviours,
      behaviours,
      SketchBehaviours.get(detail.typeaheadBehaviours())
    ),

    eventOrder: detail.eventOrder(),

    events: AlloyEvents.derive([
      AlloyEvents.runOnExecute((comp) => {
        const anchor: HotspotAnchorSpec = { anchor: 'hotspot', hotspot: comp };
        const onOpenSync = Fun.noop;
        DropdownUtils.togglePopup(detail, mapFetch(comp), anchor, comp, externals, onOpenSync).get(Fun.noop);
      })
    ].concat(detail.dismissOnBlur() ? [
      AlloyEvents.run(SystemEvents.postBlur(), (typeahead) => {
        const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
        // Only close the sandbox if the focus isn't inside it!
        if (Focus.search(sandbox.element()).isNone()) {
          Sandboxing.close(sandbox);
        }
      })
    ] : [ ]))
  };
};

export {
  make
};