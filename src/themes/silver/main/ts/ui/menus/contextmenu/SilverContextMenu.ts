import { AlloyComponent, GuiFactory, InlineView } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Element } from '@ephox/dom-globals';
import { Arr, Fun, Result, Type } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { ItemResponse } from '../item/MenuItems';
import * as MenuParts from '../menu/MenuParts';
import * as NestedMenus from '../menu/NestedMenus';
import { getPointAnchor } from './Coords';
import Settings from './Settings';
import { UiFactoryBackstageShared } from '../../../backstage/Backstage';

const separator: Menu.SeparatorMenuItemApi = {
  type: 'separator'
};

const makeContextItem = (item: Menu.ContextMenuItem | Menu.SeparatorMenuItemApi | Menu.ContextSubMenu): Menu.SeparatorMenuItemApi | Menu.MenuItemApi => {
  switch (item.type) {
    case 'separator':
      return separator;
    case 'submenu':
      return {
        type: 'menuitem',
        text: item.text,
        icon: item.icon,
        getSubmenuItems: () => Arr.map(item.getSubmenuItems(), makeContextItem)
      };
    default:
      // case 'item', or anything else really
      return {
        type: 'menuitem',
        text: item.text,
        icon: item.icon,
        // disconnect the function from the menu item API bridge defines
        onAction: Fun.noarg(item.onAction)
      };
  }
};

type Section = string | Menu.MenuItemApi | Menu.SeparatorMenuItemApi;

function generateContextMenu(contextMenus: Record<string, Menu.ContextMenuApi>, menuItems: Record<string, Menu.MenuItemApi>, menuConfig: string[], selectedElement: Element) {
  const flattenedItems = Arr.bind(menuConfig, (name) => {
    // Either read and convert the list of items out of the plugin, or assume it's a standard menu item reference
    if (contextMenus.hasOwnProperty(name)) {
      const items = contextMenus[name].update(selectedElement);
      // TODO: Should we add a ValueSchema check here?
      if (items.length > 0) {
        const allItems = Arr.map(items, (item) => Type.isString(item) ? item : makeContextItem(item));

        const separatorArray: Section[] = ['|'];
        return separatorArray.concat(allItems).concat(separatorArray);
      } else {
        return [];
      }
    } else {
      return [name];
    }
  });

  const items = Arr.foldl<Section, Array<Menu.MenuItemApi | Menu.SeparatorMenuItemApi>>(flattenedItems, (acc, item) => {
    if (Type.isString(item)) {
      if (menuItems.hasOwnProperty(item)) {
        return acc.concat([menuItems[item]]);
      } else if (item === '|' && acc.length > 0 && acc[acc.length - 1].type !== 'separator') {
        // separator (when one isn't already at the end)
        return acc.concat([separator]);
      } else {
        return acc;
      }
    } else {
      // an already converted item
      return acc.concat([item]);
    }
  }, []);

  if (items.length > 0 && items[items.length - 1].type === 'separator') {
    items.pop();
  }

  return items;
}

const isNativeOverrideKeyEvent = function (editor, e) {
  return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
};

export const setup = (editor: Editor, lazySink: () => Result<AlloyComponent, Error>, sharedBackstage: UiFactoryBackstageShared) => {
  const contextmenu = GuiFactory.build(
    InlineView.sketch({
      dom: {
        tag: 'div',
      },
      lazySink
    })
  );

  editor.on('contextmenu', (e) => {
    if (isNativeOverrideKeyEvent(editor, e)) {
      return;
    }
    // TODO: Support keyboard shortcut to open the context menu, use selection anchor spec in that case
    // const selectionAnchorSpec = getSelectionAnchor(editor);
    const mouseAnchorSpec = getPointAnchor(editor, e);

    const registry = editor.ui.registry.getAll();
    const menuConfig = Settings.getContextMenu(editor);
    const selectedElement = editor.selection.getStart(true);

    const items = generateContextMenu(registry.contextMenus, registry.menuItems, menuConfig, selectedElement);

    if (items.length > 0) {
      e.preventDefault();

      // show the context menu, with items set to close on click
      InlineView.showMenuAt(contextmenu, mouseAnchorSpec, {
        menu: {
          markers: MenuParts.markers('normal')
        },
        data: NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, sharedBackstage.providers)
      });
    }
  });

};