import { AlloyEvents, InlineViewTypes, ItemTypes, Keying, TieredMenu, TieredMenuTypes } from '@ephox/alloy';
import { InlineContent, Menu as BridgeMenu, Toolbar } from '@ephox/bridge';
import { Arr, Obj, Optional, Optionals } from '@ephox/katamari';

import { UiFactoryBackstage, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';

import { detectSize } from '../../alien/FlatgridAutodetect';
import { SimpleBehaviours } from '../../alien/SimpleBehaviours';
import { tooltipBehaviour } from '../item/build/AutocompleteMenuItem';
import ItemResponse from '../item/ItemResponse';
import * as MenuItems from '../item/MenuItems';
import { deriveMenuMovement } from './MenuMovement';
import { markers as getMenuMarkers } from './MenuParts';
import * as MenuUtils from './MenuUtils';
import { identifyMenuLayout, MenuSearchMode } from './searchable/SearchableMenu';
import { SingleMenuItemSpec } from './SingleMenuTypes';

type PartialMenuSpec = MenuUtils.PartialMenuSpec;

export enum FocusMode {
  ContentFocus,
  UiFocus
}

const createMenuItemFromBridge = (
  item: SingleMenuItemSpec,
  itemResponse: ItemResponse,
  backstage: UiFactoryBackstage,
  menuHasIcons: boolean,
  isHorizontalMenu: boolean
): Optional<ItemTypes.ItemSpec> => {
  const providersBackstage = backstage.shared.providers;
  // If we're making a horizontal menu (mobile context menu) we want text OR icons
  // to simplify the UI. We also don't want shortcut text.
  const parseForHorizontalMenu = <T extends { text: Optional<string>; icon: Optional<string> }>(menuitem: T) => !isHorizontalMenu ? menuitem : ({
    ...menuitem,
    shortcut: Optional.none(),
    icon: menuitem.text.isSome() ? Optional.none() : menuitem.icon
  });

  switch (item.type) {
    case 'menuitem':
      return BridgeMenu.createMenuItem(item).fold(
        MenuUtils.handleError,
        (d) => Optional.some(MenuItems.normal(
          parseForHorizontalMenu(d),
          itemResponse,
          providersBackstage,
          menuHasIcons
        ))
      );

    case 'nestedmenuitem':
      return BridgeMenu.createNestedMenuItem(item).fold(
        MenuUtils.handleError,
        (d) => Optional.some(MenuItems.nested(
          parseForHorizontalMenu(d),
          itemResponse,
          providersBackstage,
          menuHasIcons,
          isHorizontalMenu
        ))
      );

    case 'togglemenuitem':
      return BridgeMenu.createToggleMenuItem(item).fold(
        MenuUtils.handleError,
        (d) => Optional.some(MenuItems.toggle(
          parseForHorizontalMenu(d),
          itemResponse,
          providersBackstage,
          menuHasIcons
        ))
      );
    case 'separator':
      return BridgeMenu.createSeparatorMenuItem(item).fold(
        MenuUtils.handleError,
        (d) => Optional.some(MenuItems.separator(d))
      );
    case 'fancymenuitem':
      return BridgeMenu.createFancyMenuItem(item).fold(
        MenuUtils.handleError,
        // Fancy menu items don't have shortcuts or icons
        (d) => MenuItems.fancy(d, backstage)
      );
    default: {
      // eslint-disable-next-line no-console
      console.error('Unknown item in general menu', item);
      return Optional.none();
    }
  }
};

export const createAutocompleteItems = (
  items: InlineContent.AutocompleterContents[],
  matchText: string,
  onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void,
  columns: 'auto' | number,
  itemResponse: ItemResponse,
  sharedBackstage: UiFactoryBackstageShared,
  highlightOn: string[]
): ItemTypes.ItemSpec[] => {
  // Render text and icons if we're using a single column, otherwise only render icons
  const renderText = columns === 1;
  const renderIcons = !renderText || MenuUtils.menuHasIcons(items);
  return Optionals.cat(
    Arr.map(items, (item) => {
      switch (item.type) {
        case 'separator':
          return InlineContent.createSeparatorItem(item).fold(
            MenuUtils.handleError,
            (d) => Optional.some(MenuItems.separator(d))
          );

        case 'cardmenuitem':
          return BridgeMenu.createCardMenuItem(item).fold(
            MenuUtils.handleError,
            (d) => Optional.some(MenuItems.card(
              {
                ...d,
                // Intercept action
                onAction: (api) => {
                  d.onAction(api);
                  onItemValueHandler(d.value, d.meta);
                }
              },
              itemResponse,
              sharedBackstage,
              {
                itemBehaviours: tooltipBehaviour(d.meta, sharedBackstage),
                cardText: {
                  matchText,
                  highlightOn
                }
              }
            ))
          );

        case 'autocompleteitem':
        default:
          return InlineContent.createAutocompleterItem(item as InlineContent.AutocompleterItemSpec).fold(
            MenuUtils.handleError,
            (d) => Optional.some(MenuItems.autocomplete(
              d,
              matchText,
              renderText,
              'normal',
              onItemValueHandler,
              itemResponse,
              sharedBackstage,
              renderIcons
            ))
          );
      }
    })
  );
};

export const createPartialMenu = (
  value: string,
  items: SingleMenuItemSpec[],
  itemResponse: ItemResponse,
  backstage: UiFactoryBackstage,
  isHorizontalMenu: boolean,
  searchMode: MenuSearchMode
): PartialMenuSpec => {
  const hasIcons = MenuUtils.menuHasIcons(items);

  const alloyItems = Optionals.cat(
    Arr.map(items, (item: SingleMenuItemSpec) => {
      // Have to check each item for an icon, instead of as part of hasIcons above,
      // else in horizontal menus, items with an icon but without text will display
      // with neither
      const itemHasIcon = (i: SingleMenuItemSpec) => isHorizontalMenu ? !Obj.has(i as Record<string, unknown>, 'text') : hasIcons;
      const createItem = (i: SingleMenuItemSpec) => createMenuItemFromBridge(
        i,
        itemResponse,
        backstage,
        itemHasIcon(i),
        isHorizontalMenu
      );
      if (item.type === 'nestedmenuitem' && item.getSubmenuItems().length <= 0) {
        return createItem({ ...item, enabled: false });
      } else {
        return createItem(item);
      }
    })
  );

  // The menu layout is dependent upon our search mode.
  const menuLayout = identifyMenuLayout(searchMode);

  const createPartial = isHorizontalMenu ?
    MenuUtils.createHorizontalPartialMenuWithAlloyItems :
    MenuUtils.createPartialMenuWithAlloyItems;
  return createPartial(value, hasIcons, alloyItems, 1, menuLayout);
};

export const createTieredDataFrom = (partialMenu: TieredMenuTypes.PartialMenuSpec & { value: string }): TieredMenuTypes.TieredData =>
  TieredMenu.singleData(partialMenu.value, partialMenu);

export const createInlineMenuFrom = (
  partialMenu: PartialMenuSpec,
  columns: number | 'auto',
  focusMode: FocusMode,
  presets: Toolbar.PresetTypes
): InlineViewTypes.InlineMenuSpec => {
  const movement = deriveMenuMovement(columns, presets);
  const menuMarkers = getMenuMarkers(presets);

  return {
    data: createTieredDataFrom({
      ...partialMenu,
      movement,
      menuBehaviours: SimpleBehaviours.unnamedEvents(columns !== 'auto' ? [ ] : [
        AlloyEvents.runOnAttached((comp, _se) => {
          detectSize(comp, 4, menuMarkers.item).each(({ numColumns, numRows }) => {
            Keying.setGridSize(comp, numRows, numColumns);
          });
        })
      ])
    }),
    menu: {
      markers: getMenuMarkers(presets),
      fakeFocus: focusMode === FocusMode.ContentFocus
    }
  };
};
