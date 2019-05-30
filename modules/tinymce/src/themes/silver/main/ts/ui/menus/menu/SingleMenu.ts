/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, FocusManagers, ItemTypes, Keying, MenuTypes, TieredMenu } from '@ephox/alloy';
import { InlineContent, Menu as BridgeMenu, Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Arr, Merger, Option, Options } from '@ephox/katamari';
import { UiFactoryBackstage, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { detectSize } from '../../alien/FlatgridAutodetect';
import { SimpleBehaviours } from '../../alien/SimpleBehaviours';
import ItemResponse from '../item/ItemResponse';
import * as MenuItems from '../item/MenuItems';
import { deriveMenuMovement } from './MenuMovement';
import { markers as getMenuMarkers } from './MenuParts';
import { createPartialMenuWithAlloyItems, handleError } from './MenuUtils';
import { SingleMenuItemApi } from './SingleMenuTypes';

export type ItemChoiceActionHandler = (value: string) => void;

export enum FocusMode { ContentFocus, UiFocus }

const hasIcon = (item) => item.icon !== undefined || item.type === 'togglemenuitem' || item.type === 'choicemenuitem';
const menuHasIcons = (xs: SingleMenuItemApi[]) => Arr.exists(xs, hasIcon);

const createMenuItemFromBridge = (item: SingleMenuItemApi, itemResponse: ItemResponse, backstage: UiFactoryBackstage, menuHasIcons: boolean = true): Option<ItemTypes.ItemSpec> => {
  const providersBackstage = backstage.shared.providers;
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
        (d) => MenuItems.fancy(d, backstage)
      );
    default: {
      console.error('Unknown item in general menu', item);
      return Option.none();
    }
  }
};

export const createAutocompleteItems = (items: InlineContent.AutocompleterItemApi[], matchText: string, onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, columns: 'auto' | number,  itemResponse: ItemResponse, sharedBackstage: UiFactoryBackstageShared) => {
  // Render text and icons if we're using a single column, otherwise only render icons
  const renderText = columns === 1;
  const renderIcons = !renderText || menuHasIcons(items);
  return Options.cat(
    Arr.map(items, (item) => {
      return InlineContent.createAutocompleterItem(item).fold(
        handleError,
        (d: InlineContent.AutocompleterItem) => Option.some(
          MenuItems.autocomplete(d, matchText, renderText, 'normal', onItemValueHandler, itemResponse, sharedBackstage, renderIcons)
        )
      );
    })
  );
};

export const createPartialMenu = (value: string, items: SingleMenuItemApi[], itemResponse: ItemResponse, backstage: UiFactoryBackstage): Partial<MenuTypes.MenuSpec> => {
  const hasIcons = menuHasIcons(items);

  const alloyItems = Options.cat(
    Arr.map(items, (item: SingleMenuItemApi) => {
      const createItem = (i: SingleMenuItemApi) => createMenuItemFromBridge(i, itemResponse, backstage, hasIcons);
      if (item.type === 'nestedmenuitem' && item.getSubmenuItems().length <= 0) {
        return createItem(Merger.merge(item, {disabled: true}));
      } else {
        return createItem(item);
      }
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