/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Registry } from '@ephox/bridge';

/**
 * TinyMCE 5 Ui registration API.
 *
 * @class tinymce.editor.ui.Registry
 */
const registry = () => {
  const bridge = Registry.create();

  return {

    /**
     * Registers a new auto completer component. When a configured string pattern
     * is matched in the content while typing, the autocompleter will be triggered.
     * Emoticons and Charmap use an autocompleter.
     * <br>
     * For information on creating an autocompleter, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/autocompleter/">
     * UI Components - Autocompleter</a>.
     *
     * @method addAutocompleter
     * @param {String} name Unique name identifying this autocomplete configuration.
     * @param {InlineContent.AutocompleterApi} obj The autocomplete configuration object.
     * @return {void} void
     */
    addAutocompleter: bridge.addAutocompleter,

    /**
     * Registers a new toolbar button that executes a command when clicked or activated
     * via keyboard navigation controls.
     * <br>
     * For information on creating a basic toolbar button, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/#basicbutton">
     * UI Components - Types of toolbar buttons: Basic button</a>.
     *
     * @method addButton
     * @param {String} name Unique name identifying the button, this button name will be used in the toolbar configuration to reference the button.
     * @param {Toolbar.ToolbarButtonApi} obj the button configuration object.
     * @return {void} void
     */
    addButton: bridge.addButton,

    /**
     * Registers a new contextual form item.
     * Similar to a context menu item, a contextual form is an item with an input
     * form element appearing when a content predicate is matched. An example
     * of a contextual form is the link plugin when the configuration
     * { link_context_toolbar: true } is used. When the cursor is on a link, a
     * contextual input form appears allowing for quick changes to the url field.
     * <br>
     * For information on creating context forms, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/contextform/">
     * UI Components - Context forms</a>.
     *
     * @method addContextForm
     * @param {String} name Unique name identifying the new contextual form item.
     * @param {Toolbar.ContextFormApi} obj the context form configuration object.
     * @return {void} void
     */
    addContextForm: bridge.addContextForm,

    /**
     * Registers a new context menu section that only appears when a content predicate is matched,
     * for example, the cursor is inside a table.
     * <br>
     * For information on creating context menus, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/contextmenu/">
     * UI Components - Context Menu</a>.
     *
     * @method addContextMenu
     * @param {String} name Unique name identifying the new context menu.
     * @param {Menu.ContextMenuApi} obj The context menu configuration object.
     * @return {void} void
     */
    addContextMenu: bridge.addContextMenu,

    /**
     * Registers a new context toolbar that only appears when a content predicate is matched for example
     * the cursor is on an image element.
     * <br>
     * For information on creating context toolbars, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/contexttoolbar/">
     * UI Components - Context Toolbar</a>.
     *
     * @method addContextToolbar
     * @param {String} name Unique name identifying the new context toolbar.
     * @param {Toolbar.ContextToolbarApi} obj The context menu configuration object.
     * @return {void} void
     */
    addContextToolbar: bridge.addContextToolbar,

    /**
     * Registers a new SVG icon, the icon name reference can be configured by any
     * TinyMCE 5 Ui components that can display an icon. The icon is only available
     * to the editor instance it was configured for.
     *
     * @method addIcon
     * @param {String} name Unique name identifying the new icon.
     * @param {svgData} string The SVG data string the browser will use to render the SVG icon.
     * @return {void} void
     */
    addIcon: bridge.addIcon,

    /**
     * Registers a new menu button. Adds a toolbar button that opens a menu when
     * clicked. The menu can be populated by items created by addMenuItem,
     * addNestedMenuItem or addToggleMenuItem.
     * <br>
     * For information on creating a toolbar menu button, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/#menubutton">
     * UI Components - Types of toolbar buttons: Menu button</a>.
     *
     * @method addMenuButton
     * @param {String} name Unique name identifying the new menu button.
     * @param {Toolbar.ToolbarMenuButtonApi} obj The menu button configuration object.
     * @return {void} void
     */
    addMenuButton: bridge.addMenuButton,

    /**
     * Registers a new menu item that executes a command when clicked or activated
     * via keyboard navigation controls.
     * <br>
     * For information on creating a basic menu item, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/menuitems/#basicmenuitems">
     * UI Components - Custom menu items: Basic menu items</a>.
     *
     * @method addMenuItem
     * @param {String} name Unique name identifying the new menu item.
     * @param {Menu.MenuItemApi} obj The menu item configuration object.
     * @return {void} void
     */
    addMenuItem: bridge.addMenuItem,

    /**
     * Registers a new menu item that reveals a submenu when clicked or activated
     * by keyboard navigation controls.The submenu can be populated by items
     * created by addMenuItem, addNestedMenuItem or addToggleMenuItem.
     * <br>
     * For information on creating a nested menu item, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/menuitems/#nestedmenuitems">
     * UI Components - Custom menu items: Nested menu items</a>.
     *
     * @method addNestedMenuItem
     * @param {String} name Unique name identifying the new nested menu item.
     * @param {Menu.NestedMenuItemApi} obj The nested menu item configuration object.
     * @return {void} void
     */
    addNestedMenuItem: bridge.addNestedMenuItem,

    /**
     * Registers a new sidebar container.
     * This sidebar container is attached to the right side of the editor and
     * can be toggled open or closed. When registered, a new toolbar toggle
     * button with the same sidebar name is created. Additionally there is a
     * ToggleSidebar command and a 'ToggleSidebar' event that can used to
     * manage the sidebar open/closed state. The tinycomments plugin uses a
     * sidebar for its Ui components.
     * <br>
     * For information on creating a custom sidebar, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/customsidebar/">
     * UI Components - Custom sidebar</a>.
     *
     * @method addSidebar
     * @param {String} name Unique name identifying the new sidebar.
     * @param {Sidebar.SidebarApi} obj The sidebar configuration object.
     * @return {void} void
     */
    addSidebar: bridge.addSidebar,

    /**
     * Registers a new split button for the toolbar. The advanced list plugin uses
     * a split button to simplify its functionality.
     * <br>
     * For information on creating a split toolbar button, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/#splitbutton">
     * UI Components - Types of toolbar buttons: Split button</a>.
     *
     * @method addSplitButton
     * @param {String} name Unique name identifying the new split button.
     * @param {Toolbar.ToolbarSplitButtonApi} obj The split button configuration object.
     * @return {void} void
     */
    addSplitButton: bridge.addSplitButton,

    /**
     * Registers a new toggle button for the toolbar. A toggle buttons state can
     * be set in the configuration.
     * <br>
     * For information on creating a toggle toolbar button, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/#togglebutton">
     * UI Components - Types of toolbar buttons: Toggle button</a>.
     *
     * @method addToggleButton
     * @param {String} name Unique name identifying the new split button.
     * @param {Toolbar.ToolbarToggleButtonApi} obj The toggle button configuration object.
     * @return {void} void
     */
    addToggleButton: bridge.addToggleButton,

    /**
     * Registers a new group toolbar button for the toolbar. Renders a toolbar button that opens a floating toolbar when
     * clicked.
     * <br>
     * <strong>Note:</strong> Group toolbar buttons can only be used when using the floating toolbar mode.
     * <br>
     * <em>Added in TinyMCE 5.2</em>
     * <br>
     * For information on creating a group toolbar button, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/typesoftoolbarbuttons/#grouptoolbarbutton">
     * UI Components - Types of toolbar buttons: Group toolbar button</a>.
     *
     * @method addGroupToolbarButton
     * @param {String} name Unique name identifying the new group toolbar button.
     * @param {Toolbar.GroupToolbarButtonApi} obj The group toolbar button configuration object.
     * @return {void} void
     */
    addGroupToolbarButton: bridge.addGroupToolbarButton,

    /**
     * Registers a new menu item that will act like a toggle button,
     * showing a tick in the menu item to represent state.
     * <br>
     * For information on creating a toggle menu item, see:
     * <a href="https://www.tiny.cloud/docs/ui-components/menuitems/#togglemenuitems">
     * UI Components - Custom menu items: Toggle menu items</a>.
     *
     * @method addToggleMenuItem
     * @param {String} name Unique name identifying the new menu item.
     * @param {Menu.ToggleMenuItemApi} obj The menu item configuration object.
     * @return {void} void
     */
    addToggleMenuItem: bridge.addToggleMenuItem,

    /* note getAll is an internal method and may not be supported in future revisions */
    getAll: bridge.getAll
  };
};

export {
  registry
};
