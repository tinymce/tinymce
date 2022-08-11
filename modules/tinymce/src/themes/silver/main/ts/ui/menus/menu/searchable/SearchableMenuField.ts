import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Input, Keying, NativeEvents, NativeSimulatedEvent, Representing } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { selectableClass as usualItemClass } from '../../item/ItemClasses';
import { redirectMenuItemInteractionEvent, RedirectMenuItemInteractionEventData, refetchTriggerEvent } from './SearchableMenuEvents';

// This is not stored in ItemClasses, because the searcher is not actually
// contained within items. It isn't part of their navigation, and it
// isn't maintained by menus. It is just part of the first menu, but
// not its items.
const menuSearcherClass = 'tox-menu__searcher';

export interface MenuSearcherState {
  readonly fetchPattern: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

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

export interface MenuSearcherSpec {
  readonly i18n: UiFactoryBackstageProviders['translate'];
}

// Make sure there is ARIA communicating the currently active item in the results.
export const setActiveDescendant = (inputComp: AlloyComponent, active: AlloyComponent): void => {
  const id = Attribute.get(active.element, 'id');
  // Only set the ARIA attribute if we found a valid id
  if (id !== undefined) {
    Attribute.set(inputComp.element, 'aria-activedescendant', id);
  }
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
          'placeholder': spec.i18n('Filter merge tags'),
          // This ARIA is based on the algolia example documented in TINY-8952
          'type': 'search',
          'aria-autocomplete': 'list'
        },
        inputBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('searcher-events', [
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
            )
          ]),

          // In addition to input handling, we want special handling for
          // Up/Down/Left/Right/Enter/Escape/Space. We can divide these into two categories
          //  - events that we don't want to allow the overall menu system to process (left and right and space)
          //  - events that we want to redispatch on the "highlighted item" based on the
          // current fake focus. I'll fix this comment, but that should give me enough
          // of a reminder as to what I'm trying to do here.
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
        ])
      })
    ]
  };
};