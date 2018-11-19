import { AlloyComponent, GuiFactory, InlineView } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Element } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Result, Type } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import * as MenuParts from '../menu/MenuParts';
import * as NestedMenus from '../menu/NestedMenus';
import { getPointAnchor, getNodeAnchor } from './Coords';
import Settings from './Settings';
import { UiFactoryBackstageShared } from '../../../backstage/Backstage';
import ItemResponse from '../item/ItemResponse';

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
        getSubmenuItems: () => {
          const items = item.getSubmenuItems();
          if (Type.isString(items)) {
            return items;
          } else {
            return Arr.map(items, (item) => Type.isString(item) ? item : makeContextItem(item));
          }
        }
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

function generateContextMenu(contextMenus: Record<string, Menu.ContextMenuApi>, menuItems: Record<string, Menu.MenuItemApi | Menu.ToggleMenuItemApi>, menuConfig: string[], selectedElement: Element) {
  const items = Arr.foldl(menuConfig, (acc, name) => {
    // Either read and convert the list of items out of the plugin, or assume it's a standard menu item reference
    if (Obj.has(contextMenus, name)) {
      const items = contextMenus[name].update(selectedElement);
      // TODO: Should we add a ValueSchema check here?
      if (Type.isString(items)) {
        return acc.concat(items.split(' ')).concat(separator);
      } else if (items.length > 0) {
        const allItems = Arr.map(items, (item) => Type.isString(item) ? item : makeContextItem(item));
        return acc.concat(allItems).concat(separator);
      } else {
        return acc;
      }
    } else if (Obj.has(menuItems, name)) {
      return acc.concat([menuItems[name], separator]);
    } else {
      return acc;
    }
  }, []);

  // Strip off the trailing separator
  return items.length > 0 ? items.slice(0, -1) : [];
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

    // Different browsers trigger the context menu from keyboards differently, so need to check both the button and target here
    // Chrome: button = 0 & target = the selection range node
    // Firefox: button = 0 & target = body
    // IE: button = 2 & target = body
    // Safari: N/A (Mac's don't expose a contextmenu keyboard shortcut)
    const isTriggeredByKeyboardEvent = e.button !== 2 || e.target === editor.getBody();
    const anchorSpec = isTriggeredByKeyboardEvent ? getNodeAnchor(editor) : getPointAnchor(editor, e);

    const registry = editor.ui.registry.getAll();
    const menuConfig = Settings.getContextMenu(editor);

    // Use the event target element for mouse clicks, otherwise fallback to the current selection
    const selectedElement = isTriggeredByKeyboardEvent ? editor.selection.getStart(true) : e.target;

    const items = generateContextMenu(registry.contextMenus, registry.menuItems, menuConfig, selectedElement);

    if (items.length > 0) {
      e.preventDefault();

      // show the context menu, with items set to close on click
      InlineView.showMenuAt(contextmenu, anchorSpec, {
        menu: {
          markers: MenuParts.markers('normal')
        },
        data: NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, sharedBackstage.providers)
      });
    }
  });

};