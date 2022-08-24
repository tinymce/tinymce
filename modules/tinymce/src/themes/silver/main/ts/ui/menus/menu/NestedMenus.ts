import { TieredData, TieredMenu } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Id, Merger, Obj, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

import ItemResponse from '../item/ItemResponse';
import { expand } from './MenuConversion';
import { MenuSearchMode } from './searchable/SearchableMenu';
import { createPartialMenu } from './SingleMenu';
import { SingleMenuItemSpec } from './SingleMenuTypes';

export interface NestedMenusSettings {
  readonly isHorizontalMenu: boolean;
  readonly search: Optional<{
    readonly placeholder: Optional<string>;
  }>;
}

const getSearchModeForField = (settings: NestedMenusSettings): MenuSearchMode => {
  return settings.search.fold<MenuSearchMode>(
    () => ({ searchMode: 'no-search' }),
    (searchSettings) => ({
      searchMode: 'search-with-field',
      placeholder: searchSettings.placeholder
    })
  );
};

const getSearchModeForResults = (settings: NestedMenusSettings): MenuSearchMode => {
  return settings.search.fold<MenuSearchMode>(
    () => ({ searchMode: 'no-search' }),
    (_) => ({ searchMode: 'search-with-results' })
  );
};

const build = (items: string | Array<string | SingleMenuItemSpec>, itemResponse: ItemResponse, backstage: UiFactoryBackstage, settings: NestedMenusSettings): Optional<TieredData> => {
  const primary = Id.generate('primary-menu');

  // The expand process identifies all the items, submenus, and triggering items
  // defined by the list of items. It substitutes the strings using the values registered
  // in the menuItem registry where necessary. It is the building blocks of TieredData,
  // but everything is still just in the bridge item format ... nothing has been turned
  // into AlloySpecs.
  const data = expand(items, backstage.shared.providers.menuItems());
  if (data.items.length === 0) {
    return Optional.none();
  }

  // Only the main menu has a searchable widget (if it is enabled)
  const mainMenuSearchMode: MenuSearchMode = getSearchModeForField(settings);
  const mainMenu = createPartialMenu(
    primary,
    data.items,
    itemResponse,
    backstage,
    settings.isHorizontalMenu,
    mainMenuSearchMode
  );

  // The submenus do not have the search field, but will have search results for
  // connecting to the search field via aria-controls
  const submenuSearchMode: MenuSearchMode = getSearchModeForResults(settings);

  const submenus = Obj.map(
    data.menus, (menuItems, menuName) => createPartialMenu(
      menuName,
      menuItems,
      itemResponse,
      backstage,
      // Currently, submenus cannot be horizontal menus (so always false)
      false,
      submenuSearchMode
    )
  );
  const menus = Merger.deepMerge(submenus, Objects.wrap(primary, mainMenu));
  return Optional.from(TieredMenu.tieredData(primary, menus, data.expansions));
};

export {
  build
};
