/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, FocusManagers, Keying, TieredMenu, MenuTypes, ItemTypes } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { InlineContent, Menu as BridgeMenu, Types } from '@ephox/bridge';
import { Arr, Option, Options } from '@ephox/katamari';
import { UiFactoryBackstageProviders, UiFactoryBackstageShared } from '../../../backstage/Backstage';
import { detectSize } from '../../alien/FlatgridAutodetect';
import { SimpleBehaviours } from '../../alien/SimpleBehaviours';
import ItemResponse from '../item/ItemResponse';
import * as MenuItems from '../item/MenuItems';
import { deriveMenuMovement } from './MenuMovement';
import { components as menuComponents, dom as menuDom, markers as getMenuMarkers } from './MenuParts';
import { forCollection, forSwatch, forToolbar } from './MenuStructures';

export type ItemChoiceActionHandler = (value: string) => void;

export enum FocusMode { ContentFocus, UiFocus }

export const handleError = (error) => {
  // tslint:disable-next-line:no-console
  console.error(ValueSchema.formatError(error));
  console.log(error);
  return Option.none();
};

export type SingleMenuItemApi = BridgeMenu.MenuItemApi | BridgeMenu.NestedMenuItemApi | BridgeMenu.ToggleMenuItemApi |
  BridgeMenu.SeparatorMenuItemApi | BridgeMenu.ChoiceMenuItemApi | BridgeMenu.FancyMenuItemApi;

const hasIcon = (item) => item.icon !== undefined || item.type === 'togglemenuitem' || item.type === 'choicemenuitem';
const menuHasIcons = (xs: SingleMenuItemApi[]) => Arr.exists(xs, hasIcon);

const createMenuItemFromBridge = (item: SingleMenuItemApi, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders, menuHasIcons: boolean = true): Option<ItemTypes.ItemSpec> => {
  switch (item.type) {
    case 'menuitem':
      return BridgeMenu.createMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.normal(d, itemResponse, providersBackstage, menuHasIcons))
      );

    case 'nestedmenuitem':
      return BridgeMenu.createNestedMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.nested(d, itemResponse, providersBackstage, menuHasIcons))
      );

    case 'togglemenuitem':
      return BridgeMenu.createToggleMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.toggle(d, itemResponse, providersBackstage))
      );
    case 'separator':
      return BridgeMenu.createSeparatorMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.separator(d))
      );
    case 'fancymenuitem':
      return BridgeMenu.createFancyMenuItem(item).fold(
        handleError,
        (d) => MenuItems.fancy(d)
      );
    default: {
      console.error('Unknown item in general menu', item);
      return Option.none();
    }
  }
};

// TODO: Potentially make this private again.
export const createPartialMenuWithAlloyItems = (value: string, hasIcons: boolean, items, columns: Types.ColumnTypes, presets: Types.PresetTypes): Partial<MenuTypes.MenuSpec> => {
  if (presets === 'color') {
    const structure = forSwatch(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal' && columns === 'auto') {
    const structure = forCollection(columns, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal' && columns === 1) {
    const structure = forCollection(1, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'normal') {
    const structure = forCollection(columns, items);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  if (presets === 'listpreview' && columns !== 'auto') {
    const structure = forToolbar(columns);
    return {
      value,
      dom: structure.dom,
      components: structure.components,
      items
    };
  }

  return {
    value,
    dom:  menuDom(hasIcons, columns, presets),
    components: menuComponents,
    items
  };
};

export const createChoiceItems = (items: SingleMenuItemApi[], onItemValueHandler: (itemValue: string) => void, columns: 'auto' | number, itemPresets: Types.PresetItemTypes, itemResponse: ItemResponse, select: (value: string) => boolean, providersBackstage: UiFactoryBackstageProviders) => {
  return Options.cat(
    Arr.map(items, (item) => {
      if (item.type === 'choiceitem') {
        return BridgeMenu.createChoiceMenuItem(item).fold(
          handleError,
          (d: BridgeMenu.ChoiceMenuItem) => Option.some(MenuItems.choice(d, columns === 1, itemPresets, onItemValueHandler, select(item.value), itemResponse, providersBackstage))
        );
      } else {
        return Option.none();
      }
    })
  );
};

export const createAutocompleteItems = (items: InlineContent.AutocompleterItemApi[], onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, columns: 'auto' | number,  itemResponse: ItemResponse, sharedBackstage: UiFactoryBackstageShared) => {
  // Render text and icons if we're using a single column, otherwise only render icons
  const renderText = columns === 1;
  const renderIcons = !renderText || menuHasIcons(items);
  return Options.cat(
    Arr.map(items, (item) => {
      return InlineContent.createAutocompleterItem(item).fold(
        handleError,
        (d: InlineContent.AutocompleterItem) => Option.some(
          MenuItems.autocomplete(d, renderText, 'normal', onItemValueHandler, itemResponse, sharedBackstage, renderIcons)
        )
      );
    })
  );
};

export const createPartialChoiceMenu = (value: string, items: SingleMenuItemApi[], onItemValueHandler: (itemValue: string) => void, columns: 'auto' | number, presets: Types.PresetTypes, itemResponse: ItemResponse, select: (value: string) => boolean, providersBackstage: UiFactoryBackstageProviders): Partial<MenuTypes.MenuSpec> => {
  const hasIcons = menuHasIcons(items);
  const presetItemTypes = presets !== 'color' ? 'normal' : 'color';
  const alloyItems = createChoiceItems(items, onItemValueHandler, columns, presetItemTypes, itemResponse, select, providersBackstage);
  return createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, columns, presets);
};

export const createPartialMenu = (value: string, items: SingleMenuItemApi[], itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): Partial<MenuTypes.MenuSpec> => {
  const hasIcons = menuHasIcons(items);
  const alloyItems = Options.cat(
    Arr.map(items, (item) => {
      return createMenuItemFromBridge(item, itemResponse, providersBackstage, hasIcons);
    })
  );
  return createPartialMenuWithAlloyItems(value, hasIcons, alloyItems, 1, 'normal');
};

export const createTieredDataFrom = (partialMenu: Partial<MenuTypes.MenuSpec>) => {
  return TieredMenu.singleData(partialMenu.value, partialMenu);
};

export const createMenuFrom = (partialMenu: Partial<MenuTypes.MenuSpec>, columns: number | 'auto', focusMode: FocusMode, presets: Types.PresetTypes): MenuTypes.MenuSpec  => {
  const focusManager = focusMode === FocusMode.ContentFocus ? FocusManagers.highlights() : FocusManagers.dom();

  const movement = deriveMenuMovement(columns, presets);
  const menuMarkers = getMenuMarkers(presets);

  return {
    dom: partialMenu.dom,
    components: partialMenu.components,
    items: partialMenu.items,
    value: partialMenu.value,
    markers: {
      selectedItem: menuMarkers.selectedItem,
      item: menuMarkers.item
    },
    movement,
    fakeFocus: focusMode === FocusMode.ContentFocus,
    focusManager,

    menuBehaviours: SimpleBehaviours.unnamedEvents(columns !== 'auto' ? [ ] : [
      AlloyEvents.runOnAttached((comp, se) => {
        detectSize(comp, 4, menuMarkers.item).each(({ numColumns, numRows }) => {
          Keying.setGridSize(comp, numRows, numColumns);
        });
      })
    ])
  };
};