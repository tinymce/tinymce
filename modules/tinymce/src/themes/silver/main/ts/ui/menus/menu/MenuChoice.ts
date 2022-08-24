import { ItemTypes } from '@ephox/alloy';
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
  const menuLayout: MenuUtils.MenuLayoutType = {
    menuType: presets
  };
  return MenuUtils.createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, columns, menuLayout);
};

export const createChoiceItems = (
  items: SingleMenuItemSpec[],
  onItemValueHandler: (itemValue: string) => void,
  columns: 'auto' | number,
  itemPresets: Toolbar.PresetItemTypes,
  itemResponse: ItemResponse,
  select: (value: string) => boolean,
  providersBackstage: UiFactoryBackstageProviders
): ItemTypes.ItemSpec[] => Optionals.cat(
  Arr.map(items, (item) => {
    if (item.type === 'choiceitem') {
      return BridgeMenu.createChoiceMenuItem(item).fold(
        MenuUtils.handleError,
        (d) => Optional.some(renderChoiceItem(
          d,
          columns === 1,
          itemPresets,
          onItemValueHandler,
          select(d.value),
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
