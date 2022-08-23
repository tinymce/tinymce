import { AlloyComponent, AlloyTriggers, Coupling, Dropdown, Focusing, Highlighting, Representing, Sandboxing, SimulatedEvent } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, Class, SelectorFind, SugarElement } from '@ephox/sugar';

import { MenuLayoutType } from '../MenuUtils';
import { RedirectMenuItemInteractionEvent } from './SearchableMenuEvents';
import { findWithinMenu, findWithinSandbox, restoreState, saveState, setActiveDescendant } from './SearchableMenuField';
import { searchResultsClass } from './SearchableMenus';

export type MenuSearchMode = NoSearchMode | SearchMenuWithFieldMode | SearchMenuWithResultsMode;
export interface NoSearchMode {
  readonly searchMode: 'no-search';
}
export interface SearchMenuWithFieldMode {
  readonly searchMode: 'search-with-field';
  readonly placeholder: Optional<string>;
}
export interface SearchMenuWithResultsMode {
  readonly searchMode: 'search-with-results';
}

const identifyMenuLayout = (searchMode: MenuSearchMode): MenuLayoutType => {
  switch (searchMode.searchMode) {
    case 'no-search': {
      return {
        menuType: 'normal'
      };
    }
    default: {
      return {
        menuType: 'searchable',
        searchMode
      };
    }
  }
};

const handleRefetchTrigger = (originalSandboxComp: AlloyComponent): void => {
  // At the moment, a Sandbox is "Represented" by its triggering Dropdown.
  // We'll want to make this an official API, in case we change it later.
  const dropdown: AlloyComponent = Representing.getValue(originalSandboxComp);

  // Because refetch will replace the entire menu, we need to store the
  // original version of the searcher state, so that we can reinstate it
  // after the fetch completes (which is async)
  const optSearcherState = findWithinSandbox(originalSandboxComp).map(
    saveState
  );

  Dropdown.refetch(dropdown).get(
    () => {
      // It has completed, so now find the searcher and set its value
      // again. We can't just use the originalSandbox, because that will
      // have been thrown away and recreated by now.
      const newSandboxComp = Coupling.getCoupled(dropdown, 'sandbox');
      optSearcherState.each(
        (searcherState) => findWithinSandbox(newSandboxComp).each(
          (inputComp) => restoreState(inputComp, searcherState)
        )
      );
    }
  );
};

// This event is triggered by the searcher for key events
// that should be handled by the currently selected item
// (that is, the one with *fake* focus, not real focus). So we
// need to redispatch them to the selected item in the sandbox.
const handleRedirectToMenuItem = (sandboxComp: AlloyComponent, se: SimulatedEvent<RedirectMenuItemInteractionEvent>): void => {
  getActiveMenuItemFrom(sandboxComp).each(
    (activeItem) => {

      AlloyTriggers.retargetAndDispatchWith(
        sandboxComp,
        activeItem.element,
        se.event.eventType,
        se.event.interactionEvent
      );
    }
  );
};

// This function is useful when you have fakeFocus, so you can't just find the
// currently focused item (or the item that triggered a key event). It relies on
// the following relationships between components
// The Sandbox creates a tieredmenu, so Sandboxing.getState returns the TieredMenu
// The TieredMenu uses Highlighting for managing which menus are active, so
// Highlighting.getHighlighted(tmenu) is the current active menu
// The Menu uses highlighting to manage the active item, so use
// Highlighting.getHighlighted(menu) to get the current item.
const getActiveMenuItemFrom = (sandboxComp: AlloyComponent): Optional<AlloyComponent> => {
  // Consider moving some of these things into shared APIs. For example, make an extra API
  // for TieredMenu to get the highlighted item.
  return Sandboxing.getState(sandboxComp)
    .bind(Highlighting.getHighlighted)
    .bind(Highlighting.getHighlighted);
};

const getSearchResults = (activeMenuComp: AlloyComponent): Optional<SugarElement<Element>> => {
  // Depending on the menu layout, the search results will either be the entire
  // menu, or something within the menu.
  return Class.has(activeMenuComp.element, searchResultsClass)
    ? Optional.some(activeMenuComp.element)
    : SelectorFind.descendant(activeMenuComp.element, '.' + searchResultsClass);
};

// Model the interaction with ARIA
const updateAriaOnHighlight = (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent): void => {
  // This ARIA behaviour is based on the algolia example documented in TINY-8952
  findWithinMenu(tmenuComp).each((inputComp) => {
    setActiveDescendant(inputComp, itemComp);

    const optActiveResults = getSearchResults(menuComp);
    optActiveResults.each(
      (resultsElem) => {
        // Link aria-controls of the input to the id of the results container.
        Attribute.getOpt(resultsElem, 'id')
          .each((controlledId) =>
            Attribute.set(inputComp.element, 'aria-controls', controlledId)
          );
      }
    );
  });

  // Update the aria-selected on the item. The removal is handled by onDehighlight
  Attribute.set(itemComp.element, 'aria-selected', 'true');
};

const updateAriaOnDehighlight = (tmenuComp: AlloyComponent, menuComp: AlloyComponent, itemComp: AlloyComponent): void => {
  // This ARIA behaviour is based on the algolia example documented in TINY-8952
  Attribute.set(itemComp.element, 'aria-selected', 'false');
};

const focusSearchField = (tmenuComp: AlloyComponent): void => {
  findWithinMenu(tmenuComp).each(
    (searcherComp) => Focusing.focus(searcherComp)
  );
};

const getSearchPattern = (dropdownComp: AlloyComponent): string => {
  // Dropdowns are "coupled" with their sandbox and generally, create them on demand.
  // When using "getExistingCoupled" of Coupling, it only returns the coupled
  // component (here: the sandbox) if it already exists ... it won't do any creation.
  // So here, we are trying to get possible fetchContext information for our fetch
  // callback. If there is no sandbox, then there is no open menu, and we
  // don't have any search context, so use an empty string. Otherwise, dive into
  // the sandbox, and find the search field's current pattern.
  const optSandboxComp = Coupling.getExistingCoupled(dropdownComp, 'sandbox');
  return optSandboxComp
    .bind(findWithinSandbox)
    .map(saveState)
    .map((state) => state.fetchPattern)
    .getOr('');
};

export {
  identifyMenuLayout,
  handleRefetchTrigger,
  handleRedirectToMenuItem,
  updateAriaOnHighlight,
  updateAriaOnDehighlight,
  focusSearchField,
  getSearchPattern
};
