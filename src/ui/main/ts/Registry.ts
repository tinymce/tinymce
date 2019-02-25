import { Registry } from '@ephox/bridge';
/**
 * TinyMCE 5 Ui registration API.
 *
 * @class tinymce.editor.ui.registry
 */
const registry = () => {
  const bridge = Registry.create();

  return {

    /**
     * Registers a new auto completer component.  When a configured string pattern is matched in the content while typing, the autocompleter will be triggered.  Emoticons and Charmap use an autocompleter.
     *
     * @method addAutocompleter
     * @param {String} name Unique name identifying this autocomplete configuration.
     * @param {InlineContent.AutocompleterApi} obj The autocomplete configuration object.
     * @return {void}
     */
    addAutocompleter: bridge.addAutocompleter,

    /**
     * Registers a new toolbar button.
     *
     * @method addButton
     * @param {String} name Unique name identifying the button, this button name will be used in the toolbar configuration to reference the button.
     * @param {Toolbar.ToolbarButtonApi} obj the button configuration object.
     * @return {void}
     */
    addButton: bridge.addButton,

    /**
     * Registers a new contextual form item. Similar to a context menu item, a context form is an item with an input form element appearing when a content predicate is matched.  An example us of a context form is the link plugin when the configuration { link_context_toolbar: true } is used.  When the cursor is on a link, a context input form appears allowing for quick changes to the url field.
     *
     * @method addContextForm
     * @param {String} name Unique name identifying the new context form item.
     * @param {Toolbar.ContextFormApi} obj the context form configuration object.
     * @return {void}
     */
    addContextForm: bridge.addContextForm,

    /**
     * Registers a new contextual menu that only appears when a content predicate is matched for example the cursor is inside a table.
     *
     * @method addContextMenu
     * @param {String} name Unique name identifying the new context menu.
     * @param {Menu.ContextMenuApi} obj The context menu configuration object.
     * @return {void}
     */
    addContextMenu: bridge.addContextMenu,

    /**
     * Registers a new contextual toolbar that only appears when a content predicate is matched for example the cursor is on an image element.
     *
     * @method addContextToolbar
     * @param {String} name Unique name identifying the new context toolbar.
     * @param {Toolbar.ContextToolbarApi} obj The context menu configuration object.
     * @return {void}
     */
    addContextToolbar: bridge.addContextToolbar,

    /**
     * Registers a new icon, the icon name referece can be configured by any TinyMCE 5 Ui components that can display an icon.  The icon is only available to the editor instance it was configured for.
     *
     * @method addIcon
     * @param {String} name Unique name identifying the new icon.
     * @param {svgData} string The SVG data string the browser will use to render the SVG icon.
     * @return {void}
     */
    addIcon:  bridge.addIcon,

    /**
     * Registers a new menu button.  By default TinyMCE has File, Edit, View, Insert ... etc menu buttons, this method allows the addition of new custom menu buttons.
     *
     * @method addMenuButton
     * @param {String} name Unique name identifying the new menu button.
     * @param {Toolbar.ToolbarMenuButtonApi} obj The menu button configuration object.
     * @return {void}
     */
    addMenuButton: bridge.addMenuButton,

    /**
     * Registers a new menu item that executes a command when clicked or activated.  All menu items can be configured to appear on a menu.  A menu item can have 3 kinds of actions when clicked or activated, execute a command (addMenuItem), reveal a nested menu (see addNestedMenuItem below), or act as a toggle with a checkmark to display state (see addToggleMenuItem below)
     *
     * @method addMenuItem
     * @param {String} name Unique name identifying the new menu item.
     * @param {Menu.MenuItemApi} obj The menu item configuration object.
     * @return {void}
     */
    addMenuItem: bridge.addMenuItem,

    /**
     * Registers a new nested menu item that reveals when a menu item is clicked or activated.  All menu items can be configured to appear on a menu.  A menu item can have 3 kinds of actions when clicked or activated, execute a command (see addMenuItem above), reveal a nested menu (addNestedMenuItem), or act as a toggle with a checkmark to display state (see addToggleMenuItem below)
     *
     * @method addNestedMenuItem
     * @param {String} name Unique name identifying the new nested menu item.
     * @param {Menu.NestedMenuItemApi} obj The nested menu item configuration object.
     * @return {void}
     */
    addNestedMenuItem: bridge.addNestedMenuItem,

    /**
     * Registers a new sidebar container.  This sidebar container is attached to the rightside of the editor and can be toggled open or closed.  The tinycomments plugin uses a sidebar for its Ui components.
     *
     * @method addSidebar
     * @param {String} name Unique name identifying the new sidebar.
     * @param {Sidebar.SidebarApi} obj The sidebar configuration object.
     * @return {void}
     */
    addSidebar: bridge.addSidebar,

    /**
     * Registers a new split button for the toolbar.  The advanced list plugin uses a split button to simplify its functionality.
     *
     * @method addSplitButton
     * @param {String} name Unique name identifying the new split button.
     * @param {Toolbar.ToolbarSplitButtonApi} obj The split button configuration object.
     * @return {void}
     */
    addSplitButton: bridge.addSplitButton,

    /**
     * Registers a new toggle button for the toolbar. A toggle buttons state can be set in the configuration.
     *
     * @method addToggleButton
     * @param {String} name Unique name identifying the new split button.
     * @param {Toolbar.ToolbarToggleButtonApi} obj The toggle button configuration object.
     * @return {void}
     */
    addToggleButton: bridge.addToggleButton,

    /**
     * Registers a new menu item that will act like a toggle button, showing a tick in the menu item to represent state.  All menu items can be configured to appear on a menu.  A menu item can have 3 kinds of actions when clicked or activated, execute a command (see addMenuItem above), reveal a nested menu (see addNestedMenuItem above), or act as a toggle with a checkmark to display state (addToggleMenuItem)
     *
     * @method addToggleMenuItem
     * @param {String} name Unique name identifying the new menu item.
     * @param {Menu.ToggleMenuItemApi} obj The menu item configuration object.
     * @return {void}
     */
    addToggleMenuItem: bridge.addToggleMenuItem,

    /**
     * This method getAll returns the registry object, which contains all the configurations added via the editor.ui.registry methods.  The registry is used by TinyMCE 5 to generate Ui components.
     *
     * @method getAll
     * @return {Object} obj { buttons, contextMenus, contextToolbars, icons, menuItems, popups, sidebars }
     */
    getAll: bridge.getAll
  };
};

export interface Ui {
  registry: Registry.Registry;
}
export {
  registry
};