import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Input, Keying, NativeEvents, NativeSimulatedEvent, Representing } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, EventArgs, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { selectableClass as usualItemClass } from '../../item/ItemClasses';
import { redirectMenuItemInteractionEvent, RedirectMenuItemInteractionEventData, refetchTriggerEvent } from './SearchableMenuEvents';

export interface MenuSearcherSpec {
  readonly placeholder: Optional<string>;
  readonly i18n: UiFactoryBackstageProviders['translate'];
}

export interface MenuSearcherState {
  readonly fetchPattern: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

// This is not stored in ItemClasses, because the searcher is not actually
// contained within items. It isn't part of their navigation, and it
// isn't maintained by menus. It is just part of the first menu, but
// not its items.
const menuSearcherClass = 'tox-menu__searcher';

// Ideally, we'd be using mementos to find it again, but we'd need to pass
// that memento onto the dropdown, which isn't going to have it. Especially,
// because the dropdown isn't responsible for putting this searcher component
// into the menu, NestedMenus is.
export const findWithinSandbox = (sandboxComp: AlloyComponent): Optional<AlloyComponent> => {
  return SelectorFind.descendant(sandboxComp.element, `.${menuSearcherClass}`).bind(
    (inputElem) => sandboxComp.getSystem().getByDom(inputElem).toOptional()
  );
};

// There is nothing sandbox-specific about this code. It just needs to be
// a container that wraps the search field.
export const findWithinMenu = findWithinSandbox;

export const restoreState = (inputComp: AlloyComponent, searcherState: MenuSearcherState): void => {
  Representing.setValue(inputComp, searcherState.fetchPattern);
  inputComp.element.dom.selectionStart = searcherState.selectionStart;
  inputComp.element.dom.selectionEnd = searcherState.selectionEnd;
};

export const saveState = (inputComp: AlloyComponent): MenuSearcherState => {
  const fetchPattern = Representing.getValue(inputComp);
  const selectionStart = inputComp.element.dom.selectionStart;
  const selectionEnd = inputComp.element.dom.selectionEnd;
  return {
    fetchPattern,
    selectionStart,
    selectionEnd
  };
};

// Make sure there is ARIA communicating the currently active item in the results.
export const setActiveDescendant = (inputComp: AlloyComponent, active: AlloyComponent): void => {
  Attribute.getOpt(active.element, 'id')
    .each((id) => Attribute.set(inputComp.element, 'aria-activedescendant', id));
};

export const renderMenuSearcher = (spec: MenuSearcherSpec): AlloySpec => {

  const handleByBrowser = (comp: AlloyComponent, se: NativeSimulatedEvent<KeyboardEvent>): Optional<boolean> => {
    // We "cut" this event, so that the browser still handles it, but it is not processed
    // by any of the above alloy components. We could also do this by stopping propagation,
    // but not preventing default, but it's probably good to allow some overarching thing
    // in the DOM (outside of alloy) to stop it if they want to.
    se.cut();

    // Returning a Some here (regardless of boolean value) is going to call `stop` on the
    // simulated event, which is going to call: preventDefault and stopPropagation. We want
    // neither of these things to happen, so we return None here to say that it hasn't been
    // handled. But because we've cut it, it will not propagate to any other alloy components
    return Optional.none();
  };

  const handleByHighlightedItem = (comp: AlloyComponent, se: NativeSimulatedEvent<KeyboardEvent>): Optional<boolean> => {
    // Because we need to redispatch based on highlighted items that we don't know about here,
    // we are going to emit an event, that the sandbox listens to, and the sandbox will
    // redispatch the event.
    const eventData: RedirectMenuItemInteractionEventData = {
      interactionEvent: se.event,
      eventType: se.event.raw.type
    };

    AlloyTriggers.emitWith(comp, redirectMenuItemInteractionEvent, eventData);
    return Optional.some(true);
  };

  const customSearcherEventsName = 'searcher-events';

  return {
    dom: {
      tag: 'div',
      // NOTE: This is very intentionally NOT the navigation class, because
      // we don't want the searcher to be part of the navigation. This class
      // is just for styling consistency. Perhaps it should be its own class.
      classes: [ usualItemClass ]
    },
    components: [
      Input.sketch({
        inputClasses: [ menuSearcherClass, 'tox-textfield' ],
        inputAttributes: {
          ...(spec.placeholder.map((placeholder) => (
            { placeholder: spec.i18n(placeholder) }
          )).getOr({ })),
          // This ARIA is based on the algolia example documented in TINY-8952
          'type': 'search',
          'aria-autocomplete': 'list'
        },
        inputBehaviours: Behaviour.derive([
          AddEventsBehaviour.config(customSearcherEventsName, [
            // When the user types into the search field, we want to retrigger
            // a fetch on the dropdown. This will be fired from within the
            // dropdown's sandbox, so the dropdown is going to have to listen
            // for it there. See CommonDropdown.ts.
            AlloyEvents.run(
              // Use "input" to handle keydown, paste etc.
              NativeEvents.input(),
              (inputComp) => {
                AlloyTriggers.emit(inputComp, refetchTriggerEvent);
              }
            ),

            AlloyEvents.run<EventArgs<KeyboardEvent>>(
              NativeEvents.keydown(),
              (inputComp, se) => {
                // The Special Keying config type since TINY-7005 processes the Escape
                // key on keyup, not keydown. We need to stop the keydown event for this
                // input, because some browsers (e.g. Chrome) will process a keydown
                // for Escape inside an input[type=search] by clearing the input value,
                // and then triggering an "input" event. This "input" event will trigger
                // a refetch, which if it completes before the keyup is fired for Escape,
                // will go back to only showing one level of menu. Then, when the escape
                // keyup is processed by Keying, it will close the single remaining menu.
                // This has the effect of closing *all* menus that are open when Escape is
                // pressed instead of the last one. So, instead, we are going to kill the
                // keydown event, so that it doesn't have the default browser behaviour, and
                // won't trigger an input (and then Refetch). Then the keyup will still fire
                // so just one level of the menu will close. This is all based on the underlying
                // assumption that preventDefault and/or stop on a keydown does not suppress
                // the related keyup. All of the documentation found so far, suggests it should
                // only suppress the keypress, not the keyup, but that might not be across all
                // browsers, or implemented consistently.
                if (se.event.raw.key === 'Escape') {
                  se.stop();
                }
              }
            )
          ]),

          // In addition to input handling, we want special handling for
          // Up/Down/Left/Right/Enter/Escape/Space. We can divide these into two categories
          //  - events that we don't want to allow the overall menu system to process (left and right and space)
          //  - events that we want to redispatch on the "highlighted item" based on the
          // current fake focus.
          Keying.config({
            mode: 'special',
            onLeft: handleByBrowser,
            onRight: handleByBrowser,
            onSpace: handleByBrowser,
            onEnter: handleByHighlightedItem,
            onEscape: handleByHighlightedItem,
            onUp: handleByHighlightedItem,
            onDown: handleByHighlightedItem
          })
        ]),

        // Because we have customised handling for keydown, and we are configuring
        // Keying, we need to specify which "behaviour" (custom events or keying) gets to
        // process the keydown event first. In this situation, we want to stop escape before
        // anything happens (although it really isn't necessary)
        eventOrder: {
          keydown: [ customSearcherEventsName, Keying.name() ]
        }
      })
    ]
  };
};
