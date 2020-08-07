/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TieredData, TieredMenu } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Id, Merger, Obj, Optional } from '@ephox/katamari';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import ItemResponse from '../item/ItemResponse';

import { expand } from './MenuConversion';
import { createPartialMenu } from './SingleMenu';
import { SingleMenuItemSpec } from './SingleMenuTypes';

// TODO: Consider moving the expansion part to alloy?
const build = (items: string | Array<string | SingleMenuItemSpec>, itemResponse: ItemResponse, backstage: UiFactoryBackstage, isHorizontalMenu: boolean): Optional<TieredData> => {
  const primary = Id.generate('primary-menu');
  const data = expand(items, backstage.shared.providers.menuItems());
  if (data.items.length === 0) {
    return Optional.none();
  }

  const mainMenu = createPartialMenu(primary, data.items, itemResponse, backstage, isHorizontalMenu);
  const submenus = Obj.map(data.menus, (menuItems, menuName) => createPartialMenu(menuName, menuItems, itemResponse, backstage, false));
  const menus = Merger.deepMerge(submenus, Objects.wrap(primary, mainMenu));
  return Optional.from(TieredMenu.tieredData(primary, menus, data.expansions));
};

// Move to a separate file. Just worried about merge conflicts.

export {
  build
};
