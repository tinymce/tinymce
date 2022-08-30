// This is just a set of basic menu structures for quickly creating ApproxStructures.

import { ApproxStructure, StructAssert } from '@ephox/agar';
import { Optional } from '@ephox/katamari';

const structMenuWith = (state: { selected: boolean }, children: StructAssert[]): StructAssert => ApproxStructure.build(
  (s, str, arr) => s.element('div', {
    attrs: {
      role: str.is('menu')
    },
    classes: [
      state.selected ? arr.has('tox-selected-menu') : arr.not('tox-selected-menu')
    ],
    children
  })
);

const structSearchResultsWith = (menuItems: StructAssert[]): StructAssert => ApproxStructure.build(
  (s, _str, arr) => s.element('div', {
    classes: [ arr.has('tox-collection--results__js') ],
    children: [
      s.element('div', {
        classes: [ arr.has('tox-collection__group') ],
        children: menuItems
      })
    ]
  })
);

const structSearchField = (placeholderOpt: Optional<string>): StructAssert => ApproxStructure.build(
  (s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-collection__item') ],
    children: [
      s.element('input', {
        attrs: {
          'type': str.is('search'),
          'aria-controls': str.startsWith('aria-controls-search-results'),
          'aria-autocomplete': str.is('list'),
          'placeholder': placeholderOpt.fold(
            () => str.none('No placeholder should be set'),
            str.is
          )
        }
      })
    ]
  })
);

// Search items don't have real focus, so their selection is dependent on aria.
const structSearchLeafItem = (state: { selected: boolean }): StructAssert => ApproxStructure.build(
  (s, str, _arr) => s.element('div', {
    attrs: {
      'role': str.is('menuitem'),
      'aria-selected': str.is(`${state.selected}`),
      'aria-haspopup': str.is('false'),
      'aria-expanded': str.none(),
      'id': str.startsWith('aria-item-search-result')
    }
  })
);

const structSearchParentItem = (state: { selected: boolean; expanded: boolean }): StructAssert => ApproxStructure.build(
  (s, str, _arr) => s.element('div', {
    attrs: {
      'role': str.is('menuitem'),
      'aria-selected': str.is(`${state.selected}`),
      'aria-expanded': str.is(`${state.expanded}`),
      'aria-haspopup': str.is('true'),
      'id': str.startsWith('aria-item-search-result')
    }
  })
);

export {
  structMenuWith,
  structSearchResultsWith,
  structSearchField,
  structSearchLeafItem,
  structSearchParentItem
};
