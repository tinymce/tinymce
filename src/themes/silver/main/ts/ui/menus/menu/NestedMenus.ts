/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import { TieredData, TieredMenu } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Id, Merger, Obj, Option } from '@ephox/katamari';

import { expand } from './MenuConversion';
import { createPartialMenu, SingleMenuItemApi } from './SingleMenu';
import ItemResponse from '../item/ItemResponse';

// TODO: Consider moving the expansion part to alloy?
const build = (items: string | Array<string | SingleMenuItemApi>, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): Option<TieredData> => {
  const primary = Id.generate('primary-menu');
  const data = expand(items, providersBackstage.menuItems());
  if (data.items.length === 0) {
    return Option.none();
  }

  const mainMenu = createPartialMenu(primary, data.items, itemResponse, providersBackstage);
  const submenus = Obj.map(data.menus, (menuItems, menuName) => createPartialMenu(menuName, menuItems, itemResponse, providersBackstage));
  const menus = Merger.deepMerge(submenus, Objects.wrap(primary, mainMenu));
  return Option.from(TieredMenu.tieredData(primary, menus, data.expansions));
};

// Move to a separate file. Just worried about merge conflicts.

export {
  build
};