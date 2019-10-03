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
import { createHorizontalPartialMenuWithAlloyItems, createPartialMenuWithAlloyItems, handleError } from './MenuUtils';
import { SingleMenuItemApi } from './SingleMenuTypes';

export type ItemChoiceActionHandler = (value: string) => void;

export enum FocusMode { ContentFocus, UiFocus }

const hasIcon = (item) => item.icon !== undefined || item.type === 'togglemenuitem' || item.type === 'choicemenuitem';
const menuHasIcons = (xs: Array<SingleMenuItemApi | InlineContent.AutocompleterContents>) => Arr.exists(xs, hasIcon);

const createMenuItemFromBridge = (item: SingleMenuItemApi, itemResponse: ItemResponse, backstage: UiFactoryBackstage, menuHasIcons: boolean, isHorizontalMenu: boolean): Option<ItemTypes.ItemSpec> => {
  const providersBackstage = backstage.shared.providers;
  // If we're making a horizontal menu (mobile context menu) we want text OR icons
  // to simplify the UI. We also don't want shortcut text.
  const parseForHorizontalMenu = (menuitem) => !isHorizontalMenu ? menuitem : ({
    ...menuitem,
    shortcut: Option.none(),
    icon: menuitem.text.isSome() ? Option.none() : menuitem.icon,
  });
  switch (item.type) {
    case 'menuitem':
      return BridgeMenu.createMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.normal(parseForHorizontalMenu(d), itemResponse, providersBackstage, menuHasIcons))
      );

    case 'nestedmenuitem':
      return BridgeMenu.createNestedMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.nested(parseForHorizontalMenu(d), itemResponse, providersBackstage, menuHasIcons, isHorizontalMenu))
      );

    case 'togglemenuitem':
      return BridgeMenu.createToggleMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.toggle(parseForHorizontalMenu(d), itemResponse, providersBackstage))
      );
    case 'separator':
      return BridgeMenu.createSeparatorMenuItem(item).fold(
        handleError,
        (d) => Option.some(MenuItems.separator(d))
      );
    case 'fancymenuitem':
      return BridgeMenu.createFancyMenuItem(item).fold(
        handleError,
        (d) => MenuItems.fancy(parseForHorizontalMenu(d), backstage)
      );
    default: {
      // tslint:disable-next-line:no-console
      console.error('Unknown item in general menu', item);
      return Option.none();
    }
  }
};

export const createAutocompleteItems = (items: InlineContent.AutocompleterContents[], matchText: string, onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, columns: 'auto' | number,  itemResponse: ItemResponse, sharedBackstage: UiFactoryBackstageShared) => {
  // Render text and icons if we're using a single column, otherwise only render icons
  const renderText = columns === 1;
  const renderIcons = !renderText || menuHasIcons(items);
  return Options.cat(
    Arr.map(items, (item) => {
      if (item.type === 'separator') {
        return InlineContent.createSeparatorItem(item).fold(
          handleError,
          (d) => Option.some(MenuItems.separator(d))
        );
      } else {
        return InlineContent.createAutocompleterItem(item).fold(
          handleError,
          (d: InlineContent.AutocompleterItem) => Option.some(
            MenuItems.autocomplete(d, matchText, renderText, 'normal', onItemValueHandler, itemResponse, sharedBackstage, renderIcons)
          )
        );
      }
    })
  );
};

export const createPartialMenu = (value: string, items: SingleMenuItemApi[], itemResponse: ItemResponse, backstage: UiFactoryBackstage, isHorizontalMenu: boolean): Partial<MenuTypes.MenuSpec> => {
  const hasIcons = menuHasIcons(items);

  const alloyItems = Options.cat(
    Arr.map(items, (item: SingleMenuItemApi) => {
      // Have to check each item for an icon, instead of as part of hasIcons above,
      // else in horizontal menus, items with an icon but without text will display
      // with neither
      const itemHasIcon = (i) => isHorizontalMenu ? !i.hasOwnProperty('text') : hasIcons;
      const createItem = (i: SingleMenuItemApi) => createMenuItemFromBridge(i, itemResponse, backstage, itemHasIcon(i), isHorizontalMenu);
      if (item.type === 'nestedmenuitem' && item.getSubmenuItems().length <= 0) {
        return createItem(Merger.merge(item, {disabled: true}));
      } else {
        return createItem(item);
      }
    })
  );
  const createPartial = isHorizontalMenu ? createHorizontalPartialMenuWithAlloyItems : createPartialMenuWithAlloyItems;
  return createPartial(value, hasIcons, alloyItems, 1, 'normal');
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
