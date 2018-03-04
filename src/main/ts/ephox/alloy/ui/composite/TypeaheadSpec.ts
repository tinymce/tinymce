import { Fun, Merger, Option } from '@ephox/katamari';
import { Value } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import Sandboxing from '../../api/behaviour/Sandboxing';
import Streaming from '../../api/behaviour/Streaming';
import Toggling from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import SystemEvents from '../../api/events/SystemEvents';
import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as InputBase from '../common/InputBase';

const make = function (detail, components, spec, externals) {
  const navigateList = function (comp, simulatedEvent, highlighter) {
    const sandbox = Coupling.getCoupled(comp, 'sandbox');
    if (Sandboxing.isOpen(sandbox)) {
      Composing.getCurrent(sandbox).each(function (menu) {
        Highlighting.getHighlighted(menu).fold(function () {
          highlighter(menu);
        }, function () {
          AlloyTriggers.dispatchEvent(sandbox, menu.element(), 'keydown', simulatedEvent);
        });
      });
    } else {
      const anchor = { anchor: 'hotspot', hotspot: comp };
      const onOpenSync = function (sandbox) {
        Composing.getCurrent(sandbox).each(highlighter);
      };
      DropdownUtils.open(detail, anchor, comp, sandbox, externals, onOpenSync).get(Fun.noop);
    }
  };

  // Due to the fact that typeahead probably need to separate value from text, they can't reuse
  // (easily) the same representing logic as input fields.
  const inputBehaviours = InputBase.behaviours(detail);

  const behaviours = Behaviour.derive([
    Focusing.config({ }),
    Representing.config({
      store: {
        mode: 'dataset',
        getDataKey (typeahead) {
          return Value.get(typeahead.element());
        },
        initialValue: detail.data().getOr(undefined),
        getFallbackEntry (key) {
          return { value: key, text: key };
        },
        setData (typeahead, data) {
          Value.set(typeahead.element(), data.text);
        }
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

            const previousValue = Composing.getCurrent(sandbox).bind(function (menu) {
              return Highlighting.getHighlighted(menu).map(Representing.getValue);
            });

            detail.previewing().set(true);

            const onOpenSync = function (_sandbox) {
              Composing.getCurrent(sandbox).each(function (menu) {
                previousValue.fold(function () {
                  Highlighting.highlightFirst(menu);
                }, function (pv) {
                  Highlighting.highlightBy(menu, function (item) {
                    return Representing.getValue(item).value === pv.value;
                  });

                  // Highlight first if could not find it?
                  Highlighting.getHighlighted(menu).orThunk(function () {
                    Highlighting.highlightFirst(menu);
                    return Option.none();
                  });
                });
              });
            };

            const anchor = { anchor: 'hotspot', hotspot: component };
            DropdownUtils.open(detail, anchor, component, sandbox, externals, onOpenSync).get(Fun.noop);
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
        detail.onExecute()(sandbox, comp);
        const currentValue = Representing.getValue(comp);
        comp.element().dom().setSelectionRange(currentValue.text.length, currentValue.text.length);
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
      inputBehaviours,
      behaviours,
      SketchBehaviours.get(detail.typeaheadBehaviours())
    ),

    events: AlloyEvents.derive([
      AlloyEvents.runOnExecute(function (comp) {
        const anchor = { anchor: 'hotspot', hotspot: comp };
        const onOpenSync = Fun.noop;
        DropdownUtils.togglePopup(detail, anchor, comp, externals, onOpenSync).get(Fun.noop);
      })
    ].concat(detail.dismissOnBlur() ? [
      AlloyEvents.run(SystemEvents.postBlur(), function (typeahead) {
        const sandbox = Coupling.getCoupled(typeahead, 'sandbox');
        Sandboxing.close(sandbox);
      })
    ] : [ ]))
  };
};

export {
  make
};