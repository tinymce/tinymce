import { ItemTypes, MenuTypes } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { InlineContent, Menu, Toolbar } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { components as menuComponents, dom as menuDom } from './MenuParts';
import { forCollection, forCollectionWithSearchField, forCollectionWithSearchResults, forHorizontalCollection, forSwatch, forToolbar, StructureSpec } from './MenuStructures';
import { SearchMenuWithFieldMode, SearchMenuWithResultsMode } from './searchable/SearchableMenu';
import { SingleMenuItemSpec } from './SingleMenuTypes';

export interface PartialMenuSpec {
  readonly value: string;
  readonly dom: MenuTypes.MenuSpec['dom'];
  readonly components: MenuTypes.MenuSpec['components'];
  readonly items: MenuTypes.MenuSpec['items'];
}

// This is an internal version of the presets, that includes a couple more
// options which aren't available externally relating to searching
export type MenuLayoutType = UnsearchableMenuLayout | SearchableMenuLayout;

export interface UnsearchableMenuLayout {
  readonly menuType: 'color' | 'normal' | 'listpreview';
}

export interface SearchableMenuLayout {
  readonly menuType: 'searchable';
  readonly searchMode: SearchMenuWithFieldMode | SearchMenuWithResultsMode;
}

export const menuHasIcons = (xs: Array<SingleMenuItemSpec | Menu.CardMenuItemSpec | InlineContent.AutocompleterItemSpec>): boolean =>
  Arr.exists(xs, (item) => 'icon' in item && item.icon !== undefined);

export const handleError = (error: StructureSchema.SchemaError<any>): Optional<ItemTypes.ItemSpec> => {
  // eslint-disable-next-line no-console
  console.error(StructureSchema.formatError(error));
  // eslint-disable-next-line no-console
  console.log(error);
  return Optional.none();
};

export const createHorizontalPartialMenuWithAlloyItems = (value: string, _hasIcons: boolean, items: ItemTypes.ItemSpec[], _columns: Toolbar.ColumnTypes, _menuLayout: MenuLayoutType): PartialMenuSpec => {
  // Horizontal collections do not support different menu layout structures currently.
  const structure = forHorizontalCollection(items);
  return {
    value,
    dom: structure.dom,
    components: structure.components,
    items
  };
};

export const createPartialMenuWithAlloyItems = (value: string, hasIcons: boolean, items: ItemTypes.ItemSpec[], columns: Toolbar.ColumnTypes, menuLayout: MenuLayoutType): PartialMenuSpec => {
  const getNormalStructure = (): StructureSpec => {
    if (menuLayout.menuType !== 'searchable') {
      return forCollection(columns, items);
    } else {
      return menuLayout.searchMode.searchMode === 'search-with-field'
        ? forCollectionWithSearchField(columns, items, menuLayout.searchMode)
        : forCollectionWithSearchResults(columns, items);
    }
  };

  if (menuLayout.menuType === 'color') {
    const structure = forSwatch(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  } else if (menuLayout.menuType === 'normal' && columns === 'auto') {
    const structure = forCollection(columns, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  } else if (menuLayout.menuType === 'normal' || menuLayout.menuType === 'searchable') {
    const structure = getNormalStructure();
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  } else if (menuLayout.menuType === 'listpreview' && columns !== 'auto') {
    const structure = forToolbar(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  } else {
    return {
      value,
      dom: menuDom(hasIcons, columns, menuLayout.menuType),
      components: menuComponents,
      items
    };
  }
};
