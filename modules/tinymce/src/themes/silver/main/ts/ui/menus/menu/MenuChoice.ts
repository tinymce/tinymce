/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu as BridgeMenu, Toolbar } from '@ephox/bridge';
import { Arr, Optional, Optionals } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import { renderChoiceItem } from '../item/build/ChoiceItem';
import ItemResponse from '../item/ItemResponse';
import * as MenuUtils from './MenuUtils';
import { SingleMenuItemSpec } from './SingleMenuTypes';

type PartialMenuSpec = MenuUtils.PartialMenuSpec;

export const createPartialChoiceMenu = (
  value: string,
  items: SingleMenuItemSpec[],
  onItemValueHandler: (itemValue: string) => void,
  columns: 'auto' | number,
  presets: Toolbar.PresetTypes,
  itemResponse: ItemResponse,
  select: (value: string) => boolean,
  providersBackstage: UiFactoryBackstageProviders
): PartialMenuSpec => {
  const hasIcons = MenuUtils.menuHasIcons(items);
  const presetItemTypes = presets !== 'color' ? 'normal' : 'color';
  const alloyItems = createChoiceItems(items, onItemValueHandler, columns, presetItemTypes, itemResponse, select, providersBackstage);
  return MenuUtils.createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, columns, presets);
};

export const createChoiceItems = (
  items: SingleMenuItemSpec[],
  onItemValueHandler: (itemValue: string) => void,
  columns: 'auto' | number,
  itemPresets: Toolbar.PresetItemTypes,
  itemResponse: ItemResponse,
  select: (value: string) => boolean,
  providersBackstage: UiFactoryBackstageProviders
) => Optionals.cat(
  Arr.map(items, (item) => {
    if (item.type === 'choiceitem') {
      return BridgeMenu.createChoiceMenuItem(item).fold(
        MenuUtils.handleError,
        (d: BridgeMenu.ChoiceMenuItem) => Optional.some(renderChoiceItem(
          d, columns === 1,
          itemPresets,
          onItemValueHandler,
          select(item.value),
          itemResponse,
          providersBackstage,
          MenuUtils.menuHasIcons(items)
        ))
      );
    } else {
      return Optional.none();
    }
  })
);
