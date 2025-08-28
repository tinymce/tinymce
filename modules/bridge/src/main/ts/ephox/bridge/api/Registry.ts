import type { AutocompleterSpec } from '../components/content/Autocompleter';
import type { ContextFormSpec } from '../components/content/ContextForm';
import type { ContextToolbarSpec } from '../components/content/ContextToolbar';
import type { ContextMenuApi } from '../components/menu/ContextMenu';
import type { MenuItemSpec } from '../components/menu/MenuItem';
import type { NestedMenuItemSpec } from '../components/menu/NestedMenuItem';
import type { ToggleMenuItemSpec } from '../components/menu/ToggleMenuItem';
import type { SidebarSpec } from '../components/sidebar/Sidebar';
import type { GroupToolbarButtonSpec } from '../components/toolbar/GroupToolbarButton';
import type { ToolbarButtonSpec } from '../components/toolbar/ToolbarButton';
import type { ToolbarMenuButtonSpec } from '../components/toolbar/ToolbarMenuButton';
import type { ToolbarSplitButtonSpec } from '../components/toolbar/ToolbarSplitButton';
import type { ToolbarToggleButtonSpec } from '../components/toolbar/ToolbarToggleButton';
import type { ViewSpec } from '../components/view/View';

// This would be part of the tinymce api under editor.ui.* so editor.ui.addButton('bold', ...)
// TODO: This should maybe not be part of this project but rather something built into tinymce core using these public types

export interface Registry {
  addButton: (name: string, spec: ToolbarButtonSpec) => void;
  addGroupToolbarButton: (name: string, spec: GroupToolbarButtonSpec) => void;
  addToggleButton: (name: string, spec: ToolbarToggleButtonSpec) => void;
  addMenuButton: (name: string, spec: ToolbarMenuButtonSpec) => void;
  addSplitButton: (name: string, spec: ToolbarSplitButtonSpec) => void;
  addMenuItem: (name: string, spec: MenuItemSpec) => void;
  addNestedMenuItem: (name: string, spec: NestedMenuItemSpec) => void;
  addToggleMenuItem: (name: string, spec: ToggleMenuItemSpec) => void;
  addContextMenu: (name: string, spec: ContextMenuApi) => void;
  addContextToolbar: (name: string, spec: ContextToolbarSpec) => void;
  addContextForm: (name: string, spec: ContextFormSpec) => void;
  addIcon: (name: string, svgData: string) => void;
  addAutocompleter: (name: string, spec: AutocompleterSpec) => void;
  addSidebar: (name: string, spec: SidebarSpec) => void;
  addView: (name: string, spec: ViewSpec) => void;
  addContext: (name: string, pred: (args: string) => boolean) => void;

  getAll: () => {
    buttons: Record<string, ToolbarButtonSpec | GroupToolbarButtonSpec | ToolbarMenuButtonSpec | ToolbarSplitButtonSpec | ToolbarToggleButtonSpec>;
    menuItems: Record<string, MenuItemSpec | NestedMenuItemSpec | ToggleMenuItemSpec>;
    popups: Record<string, AutocompleterSpec>;
    contextMenus: Record<string, ContextMenuApi>;
    contextToolbars: Record<string, ContextToolbarSpec | ContextFormSpec>;
    icons: Record<string, string>;
    sidebars: Record<string, SidebarSpec>;
    views: Record<string, ViewSpec>;
    contexts: Record<string, (args: string) => boolean>;
  };
}

export const create = (): Registry => {
  const buttons: Record<string, ToolbarButtonSpec | GroupToolbarButtonSpec | ToolbarMenuButtonSpec | ToolbarSplitButtonSpec | ToolbarToggleButtonSpec> = {};
  const menuItems: Record<string, MenuItemSpec | NestedMenuItemSpec | ToggleMenuItemSpec> = {};
  const popups: Record<string, AutocompleterSpec> = {};
  const icons: Record<string, string> = {};
  const contextMenus: Record<string, ContextMenuApi> = {};
  const contextToolbars: Record<string, ContextToolbarSpec | ContextFormSpec> = {};
  const contexts: Record<string, (args: string) => boolean> = {};
  const sidebars: Record<string, SidebarSpec> = {};
  const views: Record<string, ViewSpec> = {};
  const add = <T, S extends T>(collection: Record<string, T>, type: string) => (name: string, spec: S): void => {
    collection[name.toLowerCase()] = { ...spec, type };
  };
  const addDefaulted = <T, S extends T>(collection: Record<string, T>, type: string) => (name: string, spec: S): void => {
    collection[name.toLowerCase()] = { type, ...spec };
  };
  const addIcon = (name: string, svgData: string) => icons[name.toLowerCase()] = svgData;
  const addContext = (name: string, pred: (args: string) => boolean) => contexts[name.toLowerCase()] = pred;

  return {
    addButton: add(buttons, 'button'),
    addGroupToolbarButton: add(buttons, 'grouptoolbarbutton'),
    addToggleButton: add(buttons, 'togglebutton'),
    addMenuButton: add(buttons, 'menubutton'),
    addSplitButton: add(buttons, 'splitbutton'),
    addMenuItem: add(menuItems, 'menuitem'),
    addNestedMenuItem: add(menuItems, 'nestedmenuitem'),
    addToggleMenuItem: add(menuItems, 'togglemenuitem'),
    addAutocompleter: add(popups, 'autocompleter'),
    addContextMenu: add(contextMenus, 'contextmenu'),
    addContextToolbar: add(contextToolbars, 'contexttoolbar'),
    addContextForm: addDefaulted(contextToolbars, 'contextform'),
    addSidebar: add(sidebars, 'sidebar'),
    addView: add(views, 'views'),
    addIcon,
    addContext,

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
      sidebars,
      views,
      contexts
    })
  };
};
