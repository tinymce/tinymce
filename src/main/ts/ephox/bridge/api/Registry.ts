import { Merger } from '@ephox/katamari';
import { ToolbarToggleButtonApi } from '../components/toolbar/ToolbarToggleButton';
import { ToolbarSplitButtonApi } from '../components/toolbar/ToolbarSplitButton';
import { ToolbarButtonApi } from '../components/toolbar/ToolbarButton';
import { ToolbarMenuButtonApi } from '../components/toolbar/ToolbarMenuButton';
import { MenuItemApi } from '../components/menu/MenuItem';
import { NestedMenuItemApi } from '../components/menu/NestedMenuItem';
import { ToggleMenuItemApi } from '../components/menu/ToggleMenuItem';
import { ContextMenuApi } from '../components/menu/ContextMenu';
import { ContextToolbarApi, ContextFormApi } from '../components/toolbar/ContextToolbar';
import { AutocompleterApi } from '../components/content/Autocompleter';
import { SidebarApi } from '../components/sidebar/Sidebar';

// This would be part of the tinymce api under editor.ui.* so editor.ui.addButton('bold', ...)
// TODO: This should maybe not be part of this project but rather something built into tinymce core using these public types

export interface Registry {
  addButton: (name: string, spec: ToolbarButtonApi) => void;
  addToggleButton: (name: string, spec: ToolbarToggleButtonApi) => void;
  addMenuButton: (name: string, spec: ToolbarMenuButtonApi) => void;
  addSplitButton: (name: string, spec: ToolbarSplitButtonApi) => void;
  addMenuItem: (name: string, spec: MenuItemApi) => void;
  addNestedMenuItem: (name: string, spec: NestedMenuItemApi) => void;
  addToggleMenuItem: (name: string, spec: ToggleMenuItemApi) => void;
  addContextMenu: (name: string, spec: ContextMenuApi) => void;
  addContextToolbar: (name: string, spec: ContextToolbarApi) => void;
  addContextForm: (name: string, spec: ContextFormApi) => void;
  addIcon: (name: string, svgData: string) => void;
  addAutocompleter: (name: string, spec: AutocompleterApi) => void;
  addSidebar: (name: string, spec: SidebarApi) => void;

  getAll: () => {
    buttons: Record<string, ToolbarButtonApi | ToolbarMenuButtonApi | ToolbarSplitButtonApi | ToolbarToggleButtonApi>;
    menuItems: Record<string, MenuItemApi | NestedMenuItemApi | ToggleMenuItemApi>;
    popups: Record<string, AutocompleterApi>;
    contextMenus: Record<string, ContextMenuApi>;
    contextToolbars: Record<string, ContextToolbarApi | ContextFormApi>;
    icons: Record<string, string>;
    sidebars: Record<string, SidebarApi>;
  };
}

export const create = (): Registry => {
  const buttons: Record<string, ToolbarButtonApi | ToolbarMenuButtonApi | ToolbarSplitButtonApi | ToolbarToggleButtonApi> = {};
  const menuItems: Record<string, MenuItemApi | ToggleMenuItemApi> = {};
  const popups: Record<string, AutocompleterApi> = {};
  const icons: Record<string, string> = {};
  const contextMenus: Record<string, ContextMenuApi> = {};
  const contextToolbars: Record<string, ContextToolbarApi | ContextFormApi> = {};
  const sidebars: Record<string, SidebarApi> = {};
  const add = (collection, type: string) => (name: string, spec: any): void => collection[name.toLowerCase()] = Merger.merge({ type }, spec);
  const addIcon = (name: string, svgData: string) => icons[name.toLowerCase()] = svgData;

  return {
    addButton: add(buttons, 'button'),
    addToggleButton: add(buttons, 'togglebutton'),
    addMenuButton: add(buttons, 'menubutton'),
    addSplitButton: add(buttons, 'splitbutton'),
    addMenuItem: add(menuItems, 'menuitem'),
    addNestedMenuItem: add(menuItems, 'nestedmenuitem'),
    addToggleMenuItem: add(menuItems, 'togglemenuitem'),
    addAutocompleter: add(popups, 'autocompleter'),
    addContextMenu: add(contextMenus, 'contextmenu'),
    addContextToolbar: add(contextToolbars, 'contexttoolbar'),
    addContextForm: add(contextToolbars, 'contextform'),
    addSidebar: add(sidebars, 'sidebar'),
    addIcon,

    getAll: () => ({
      buttons,
      menuItems,
      icons,

      // TODO: should popups be combined with context menus? We'd need to make a new add function.
      // Right now using `add` shares the key namespace, which prevents registering both
      // a completer and a context menu with the same name
      popups,
      contextMenus,

      contextToolbars,
      sidebars
    })
  };
};
