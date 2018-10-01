import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import { TieredData, TieredMenu } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Id, Merger, Obj } from '@ephox/katamari';

import { ItemResponse } from '../item/MenuItems';
import { expand } from './MenuConversion';
import { createPartialMenu, SingleMenuItemApi } from './SingleMenu';

// TODO: Consider moving the expansion part to alloy?
const build = (items: SingleMenuItemApi[], itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): TieredData => {
  const primary = Id.generate('primary-menu');
  const data = expand(items);
  const mainMenu = createPartialMenu(primary, data.items, itemResponse, providersBackstage);
  const submenus = Obj.map(data.menus, (menuItems, menuName) => createPartialMenu(menuName, menuItems, itemResponse, providersBackstage));
  const menus = Merger.deepMerge(submenus, Objects.wrap(primary, mainMenu));
  return TieredMenu.tieredData(primary, menus, data.expansions);
};

// Move to a separate file. Just worried about merge conflicts.

export {
  build
};