import { Menu as BridgeMenu, Types } from '@ephox/bridge';
import { Arr, Option, Options } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import { renderChoiceItem } from '../item/build/ChoiceItem';
import ItemResponse from '../item/ItemResponse';
import * as MenuUtils from './MenuUtils';
import { SingleMenuItemApi } from './SingleMenuTypes';

type PartialMenuSpec = MenuUtils.PartialMenuSpec;

export const createPartialChoiceMenu = (
  value: string,
  items: SingleMenuItemApi[],
  onItemValueHandler: (itemValue: string) => void,
  columns: 'auto' | number,
  presets: Types.PresetTypes,
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
  items: SingleMenuItemApi[],
  onItemValueHandler: (itemValue: string) => void,
  columns: 'auto' | number,
  itemPresets: Types.PresetItemTypes,
  itemResponse: ItemResponse,
  select: (value: string) => boolean,
  providersBackstage: UiFactoryBackstageProviders
) => Options.cat(
  Arr.map(items, (item) => {
    if (item.type === 'choiceitem') {
      return BridgeMenu.createChoiceMenuItem(item).fold(
        MenuUtils.handleError,
        (d: BridgeMenu.ChoiceMenuItem) => Option.some(renderChoiceItem(
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
      return Option.none();
    }
  })
);
