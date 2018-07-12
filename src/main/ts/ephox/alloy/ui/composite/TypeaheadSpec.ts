import { Fun, Merger, Option, Cell, Arr, Obj } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

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
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as InputBase from '../common/InputBase';

import { EventFormat, SimulatedEvent, CustomEvent } from '../../events/SimulatedEvent';
import { HTMLInputElement, console } from '@ephox/dom-globals';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { TypeaheadDetail, TypeaheadSpec, TypeaheadData } from '../../ui/types/TypeaheadTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarEvent, TieredData } from '../../api/Main';
import { AnchorSpec, HotspotAnchorSpec } from '../../positioning/mode/Anchoring';
import { Objects } from '@ephox/boulder';

const make: CompositeSketchFactory<TypeaheadDetail, TypeaheadSpec> = (detail, components, spec, externals) => {
  console.log('Making a typeahead');
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
     */
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
      DropdownUtils.open(detail, mapFetch, anchor, comp, sandbox, externals, onOpenSync).get(Fun.noop);
    }
  };

  // Due to the fact that typeahead probably need to separate value from text, they can't reuse
  // (easily) the same representing logic as input fields.
  const focusBehaviours = InputBase.focusBehaviours(detail);

  const dataByValue = Cell(detail.dataset());

  // TODO: Update text.
  const dataByText = Cell({ });

  const mapFetch = (tdata: TieredData): TieredData => {
    const currentDataByValue = dataByValue.get();
    const newDataByValue = { };
    Obj.each(tdata.menus, (menuData) => {
      Arr.each(menuData.items, (itemData) => {
        if (itemData.type === 'item') {
          newDataByValue[itemData.data.value] = itemData.data;
        }
      })
    })
    dataByValue.set(
      Merger.deepMerge(currentDataByValue, newDataByValue)
    )
    console.log('Now', dataByValue.get());
    return tdata;
  };


  const behaviours = Behaviour.derive([
    Focusing.config({ }),
    Representing.config({
      store: {
        mode: 'manual',
        getValue (typeahead: AlloyComponent): TypeaheadData {
          const dataKey = Value.get(typeahead.element());
          console.log('looking up', dataKey);
          return {
            value: dataKey,
            surplus: Objects.readOptFrom(dataByValue.get(), dataKey).getOr({ })
          }
        },
        setValue: (typeahead: AlloyComponent, v: string) => {
          Value.set(typeahead.element(), v);
        },
        initialValue: detail.data().getOr(''),
        // getFallbackEntry (key: string): TypeaheadData {
        //   console.log('typeahead.getFallbackEntry', key);
        //   return { value: key, text: key };
        // },
        // setData (typeahead: AlloyComponent, data: TypeaheadData) {
        //   console.log('typeahead.setData', data);
        //   Value.set(typeahead.element(), data.text);
        // }
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
                  Highlighting.highlightFirst(menu);
                }, (pv) => {
                  Highlighting.highlightBy(menu, (item) => {
                    const itemData = Representing.getValue(item) as TypeaheadData;
                    console.log('highlightBy', itemData);
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
            DropdownUtils.open(detail, mapFetch, anchor, component, sandbox, externals, onOpenSync).get(Fun.noop);
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
        if (Sandboxing.isOpen(sandbox)) { Sandboxing.close(sandbox); }
        const currentValue = Representing.getValue(comp) as TypeaheadData;
        detail.onExecute()(sandbox, comp, currentValue);
        const input = comp.element().dom() as HTMLInputElement;
        const text = currentValue.surplus !== undefined && currentValue.surplus.text !== undefined ? currentValue.surplus.text : currentValue.value;
        input.setSelectionRange(text.length, text.length);
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
        DropdownUtils.togglePopup(detail, mapFetch, anchor, comp, externals, onOpenSync).get(Fun.noop);
      })
    ].concat(detail.dismissOnBlur() ? [
      AlloyEvents.run(SystemEvents.postBlur(), (typeahead) => {
        const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
        Sandboxing.close(sandbox);
      })
    ] : [ ]))
  };
};

export {
  make
};