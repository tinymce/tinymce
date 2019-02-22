import { Registry } from '@ephox/bridge';
/**
 * blah blah
 *
 * @class tinymce.Editor.ui
 */
const registry = () => {
  const bridge = Registry.create();

  return {
    addAutocompleter: bridge.addAutocompleter,
    addButton: bridge.addButton,

    /**
     * This method addContextForm
     *
     * @method addButton
     * @param {Object} obj Testing Mike
     * @return {Object} hello test
     */
    addContextForm: bridge.addContextForm,

    /**
     * This method addContextMenu
     *
     * @method addContextMenu
     * @param {Object} obj Testing Mike
     * @return {Object} hello test
     */
    addContextMenu: bridge.addContextMenu,
    addContextToolbar: bridge.addContextToolbar,
    addIcon:  bridge.addIcon,
    addMenuButton: bridge.addMenuButton,
    addMenuItem: bridge.addMenuItem,
    addNestedMenuItem: bridge.addNestedMenuItem,
    addSidebar: bridge.addSidebar,
    addSplitButton: bridge.addSplitButton,
    addToggleButton: bridge.addToggleButton,
    addToggleMenuItem: bridge.addToggleMenuItem,
    getAll: bridge.getAll
  };
};

export interface Ui {
  registry: Registry.Registry;
}
export {
  registry
};