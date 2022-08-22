import { AlloySpec, ItemTypes, Menu as AlloyMenu, RawDomSchema, SimpleSpec } from '@ephox/alloy';
import { Arr, Fun, Id, Obj } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';

import { SearchMenuWithFieldMode } from './searchable/SearchableMenu';
import { renderMenuSearcher } from './searchable/SearchableMenuField';
import { augmentWithAria, searchResultsClass } from './searchable/SearchableMenus';

export interface StructureSpec extends SimpleSpec {
  readonly dom: RawDomSchema;
  readonly components: AlloySpec[];
}

const chunk = <I>(rowDom: RawDomSchema, numColumns: number) => (items: I[]): Array<{ dom: RawDomSchema; components: I[] }> => {
  const chunks = Arr.chunk(items, numColumns);
  return Arr.map(chunks, (c) => ({
    dom: rowDom,
    components: c
  }));
};

const forSwatch = (columns: number | 'auto'): StructureSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-menu', 'tox-swatches-menu' ]
  },
  components: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-swatches' ]
      },
      components: [
        AlloyMenu.parts.items({
          preprocess: columns !== 'auto' ? chunk(
            {
              tag: 'div',
              classes: [ 'tox-swatches__row' ]
            },
            columns
          ) : Fun.identity
        })
      ]
    }
  ]
});

const forToolbar = (columns: number): StructureSpec => ({
  dom: {
    tag: 'div',
    // TODO: Configurable lg setting?
    classes: [ 'tox-menu', 'tox-collection', 'tox-collection--toolbar', 'tox-collection--toolbar-lg' ]
  },
  components: [
    AlloyMenu.parts.items({
      preprocess: chunk(
        {
          tag: 'div',
          classes: [ 'tox-collection__group' ]
        },
        columns
      )
    })
  ]
});

// NOTE: That type signature isn't quite true.
const preprocessCollection = (items: ItemTypes.ItemSpec[], isSeparator: (a: ItemTypes.ItemSpec, index: number) => boolean): AlloySpec[] => {
  const allSplits: ItemTypes.ItemSpec[][] = [ ];
  let currentSplit: ItemTypes.ItemSpec[] = [ ];
  Arr.each(items, (item, i) => {
    if (isSeparator(item, i)) {
      if (currentSplit.length > 0) {
        allSplits.push(currentSplit);
      }
      currentSplit = [ ];
      if (Obj.has(item.dom, 'innerHtml') || item.components && item.components.length > 0) {
        currentSplit.push(item);
      }
    } else {
      currentSplit.push(item);
    }
  });

  if (currentSplit.length > 0) {
    allSplits.push(currentSplit);
  }

  return Arr.map(allSplits, (s) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-collection__group' ]
    },
    components: s
  }));
};

const insertItemsPlaceholder = (
  columns: number | 'auto',
  initItems: ItemTypes.ItemSpec[],
  onItem: (i: ItemTypes.ItemSpec) => ItemTypes.ItemSpec
) => {
  return AlloyMenu.parts.items({
    preprocess: (rawItems: ItemTypes.ItemSpec[]) => {
      // Add any information to the items that is required. For example
      // when the items are results in a searchable menu, we need them to have
      // an ID that can be referenced by aria-activedescendant
      const enrichedItems = Arr.map(rawItems, onItem);
      if (columns !== 'auto' && columns > 1) {
        return chunk<AlloySpec>({
          tag: 'div',
          classes: [ 'tox-collection__group' ]
        }, columns)(enrichedItems);
      } else {
        return preprocessCollection(enrichedItems, (_item, i) => initItems[i].type === 'separator');
      }
    }
  });
};

const forCollection = (columns: number | 'auto', initItems: ItemTypes.ItemSpec[], _hasIcons: boolean = true): StructureSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-menu', 'tox-collection' ].concat(
      columns === 1 ? [ 'tox-collection--list' ] : [ 'tox-collection--grid' ]
    )
  },
  components: [
    // We don't need to add IDs for each item because there are no
    // aria relationships we need to maintain
    insertItemsPlaceholder(columns, initItems, Fun.identity)
  ]
});

const forCollectionWithSearchResults = (columns: number | 'auto', initItems: ItemTypes.ItemSpec[], _hasIcons: boolean = true): StructureSpec => {
  // A collection with results is exactly like a collection, except it also has
  // an ID and class on its outer div to allow for aria-controls relationships, and ids
  // on its items.

  // This connects the search bar with the list box.
  const ariaControlsSearchResults = Id.generate('aria-controls-search-results');

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-menu', 'tox-collection', searchResultsClass ].concat(
        columns === 1 ? [ 'tox-collection--list' ] : [ 'tox-collection--grid' ]
      ),
      attributes: {
        id: ariaControlsSearchResults
      }
    },
    components: [
      // For each item, it needs to have an ID, so that we can refer to it
      // by the aria-activedescendant attribute
      insertItemsPlaceholder(columns, initItems, augmentWithAria)
    ]
  };
};

// Does a searchable menu *really* support columns !== 1 ?
const forCollectionWithSearchField = (columns: number | 'auto', initItems: ItemTypes.ItemSpec[], searchField: SearchMenuWithFieldMode): StructureSpec => {

  // This connects the search bar with the list box.
  const ariaControlsSearchResults = Id.generate('aria-controls-search-results');

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-menu', 'tox-collection' ].concat(
        columns === 1 ? [ 'tox-collection--list' ] : [ 'tox-collection--grid' ]
      )
    },
    components: [
      // Importantly, the search bar is not in the "items" part, which means that it is
      // not given any of the item decorations by default. In order to ensure that is
      // not part of the navigation, however, we need to prevent it from getting the nav
      // class. For general collection menu items, it is navClass, which is:
      // tox-menu-nav__js. So simply, do not add this class when creating
      // the search, so that it isn't in the navigation. Ideally, it would only ever look
      // inside its items section, but the items aren't guaranteed to have a separate
      // container, and navigation candidates are found anywhere inside the menu
      // container. We could add configuration to alloy's Menu movement, where there was
      // a 'navigation container' that all items would be in. That could be another
      // way to solve the problem. For now, we'll just manually avoid adding the navClass
      renderMenuSearcher({
        i18n: I18n.translate,
        placeholder: searchField.placeholder
      }),
      {
        // We need a separate container for the items, because this is the container
        // that multiple tox-collection__groups might go into, and will be the container
        // that the search bar controls.
        dom: {
          tag: 'div',
          classes: [
            ...(columns === 1 ? [ 'tox-collection--list' ] : [ 'tox-collection--grid' ]),
            searchResultsClass
          ],
          attributes: {
            id: ariaControlsSearchResults
          }
        },
        components: [
          // For each item, it needs to have an ID, so that we can refer to it
          // by the aria-activedescendant attribute
          insertItemsPlaceholder(columns, initItems, augmentWithAria)
        ]
      }
    ]
  };
};

const forHorizontalCollection = (initItems: ItemTypes.ItemSpec[], _hasIcons: boolean = true): StructureSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-collection', 'tox-collection--horizontal' ]
  },
  components: [
    AlloyMenu.parts.items({
      preprocess: (items: ItemTypes.ItemSpec[]) => preprocessCollection(items, (_item, i) => initItems[i].type === 'separator')
    })
  ]
});

export {
  chunk,
  forSwatch,
  forCollection,
  forCollectionWithSearchResults,
  forCollectionWithSearchField,
  forHorizontalCollection,
  forToolbar
};
