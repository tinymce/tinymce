/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, GuiFactory, InlineView, Sandboxing, SystemEvents } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Element as DomElement } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Result, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import * as DesktopContextMenu from './platform/DesktopContextMenu';
import * as MobileContextMenu from './platform/MobileContextMenu';
import Settings from './Settings';

type MenuItem =  string | Menu.MenuItemApi | Menu.NestedMenuItemApi | Menu.SeparatorMenuItemApi;

const isSeparator = (item: MenuItem): boolean => Type.isString(item) ? item === '|' : item.type === 'separator';

const separator: Menu.SeparatorMenuItemApi = {
  type: 'separator'
};

const makeContextItem = (item: string | Menu.ContextMenuItem | Menu.SeparatorMenuItemApi | Menu.ContextSubMenu): MenuItem => {
  if (Type.isString(item)) {
    return item;
  } else {
    switch (item.type) {
      case 'separator':
        return separator;
      case 'submenu':
        return {
          type: 'nestedmenuitem',
          text: item.text,
          icon: item.icon,
          getSubmenuItems: () => {
            const items = item.getSubmenuItems();
            if (Type.isString(items)) {
              return items;
            } else {
              return Arr.map(items, makeContextItem);
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
  }
};

const addContextMenuGroup = (xs: Array<MenuItem>, groupItems: Array<MenuItem>) => {
  // Skip if there are no items
  if (groupItems.length === 0) {
    return xs;
  }

  // Only add a separator at the beginning if the last item isn't a separator
  const lastMenuItem = Arr.last(xs).filter((item) => !isSeparator(item));
  const before = lastMenuItem.fold(
    () => [],
    (_) => [ separator ]
  );
  return xs.concat(before).concat(groupItems).concat([ separator ]);
};

const generateContextMenu = (contextMenus: Record<string, Menu.ContextMenuApi>, menuConfig: string[], selectedElement: DomElement) => {
  const sections = Arr.foldl(menuConfig, (acc, name) => {
    // Either read and convert the list of items out of the plugin, or assume it's a standard menu item reference
    if (Obj.has(contextMenus, name)) {
      const items = contextMenus[name].update(selectedElement);
      if (Type.isString(items)) {
        return addContextMenuGroup(acc, items.split(' '));
      } else if (items.length > 0) {
        // TODO: Should we add a ValueSchema check here?
        const allItems = Arr.map(items, makeContextItem);
        return addContextMenuGroup(acc, allItems);
      } else {
        return acc;
      }
    } else {
      return acc.concat([name]);
    }
  }, []);

  // Strip off any trailing separator
  if (sections.length > 0 && isSeparator(sections[sections.length - 1])) {
    sections.pop();
  }

  return sections;
};

const isNativeOverrideKeyEvent = function (editor: Editor, e) {
  return e.ctrlKey && !Settings.shouldNeverUseNative(editor);
};

export const setup = (editor: Editor, lazySink: () => Result<AlloyComponent, Error>, backstage: UiFactoryBackstage) => {
  const detection = PlatformDetection.detect();
  const isTouch = detection.deviceType.isTouch;

  const contextmenu = GuiFactory.build(
    InlineView.sketch({
      dom: {
        tag: 'div',
      },
      lazySink,
      onEscape: () => editor.focus(),
      onShow: () => backstage.setContextMenuState(true),
      onHide: () => backstage.setContextMenuState(false),
      fireDismissalEventInstead: { },
      inlineBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('dismissContextMenu', [
          AlloyEvents.run(SystemEvents.dismissRequested(), (comp, se) => {
            Sandboxing.close(comp);
            editor.focus();
          })
        ])
      ])
    }),
  );

  const hideContextMenu = (_e) => InlineView.hide(contextmenu);

  const showContextMenu = (e) => {
    const isLongpress = e.type === 'longpress';
    // Prevent the default if we should never use native
    if (Settings.shouldNeverUseNative(editor)) {
      e.preventDefault();
    }

    if (isNativeOverrideKeyEvent(editor, e) || Settings.isContextMenuDisabled(editor)) {
      return;
    }

    // Different browsers trigger the context menu from keyboards differently, so need to check both the button and target here.
    // If a longpress touch event, always treat it as a pointer event
    // Chrome: button = 0 & target = the selection range node
    // Firefox: button = 0 & target = body
    // IE/Edge: button = 2 & target = body
    // Safari: N/A (Mac's don't expose a contextmenu keyboard shortcut)
    const isTriggeredByKeyboardEvent = !isLongpress && (e.button !== 2 || e.target === editor.getBody());

    const buildMenu = () => {
      // Use the event target element for touch events, otherwise fallback to the current selection
      const selectedElement = isTriggeredByKeyboardEvent ? editor.selection.getStart(true) : e.target as DomElement;

      const registry = editor.ui.registry.getAll();
      const menuConfig = Settings.getContextMenu(editor);
      return generateContextMenu(registry.contextMenus, menuConfig, selectedElement);
    };

    const initAndShow = isTouch() ? MobileContextMenu.initAndShow : DesktopContextMenu.initAndShow;
    initAndShow(editor, e, buildMenu, backstage, contextmenu, isTriggeredByKeyboardEvent);
  };

  editor.on('init', () => {
    // Hide the context menu when scrolling or resizing
    // Except ResizeWindow on mobile which fires when the keyboard appears/disappears
    const hideEvents = 'ResizeEditor ScrollContent ScrollWindow longpresscancel' + (isTouch() ? '' : ' ResizeWindow');
    editor.on(hideEvents, hideContextMenu);
    editor.on(isTouch() ? 'longpress' : 'longpress contextmenu', showContextMenu);
  });
};
