import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';

const patchPipeConfig = (config: string[] | string): string[] =>
  Type.isString(config) ? config.split(/[ ,]/) : config;

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K] | undefined;
  <T>(name: string): (editor: Editor) => T | undefined;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('contextmenu_avoid_overlap', {
    processor: 'string',
    default: ''
  });

  registerOption('contextmenu_never_use_native', {
    processor: 'boolean',
    default: false
  });

  registerOption('contextmenu', {
    processor: (value) => {
      if (value === false) {
        return { value: [], valid: true };
      } else if (Type.isString(value) || Type.isArrayOf(value, Type.isString)) {
        return { value: patchPipeConfig(value), valid: true };
      } else {
        return { valid: false, message: 'Must be false or a string.' };
      }
    },
    default: 'link linkchecker image editimage table spellchecker configurepermanentpen'
  });
};

const shouldNeverUseNative = option('contextmenu_never_use_native');
const getAvoidOverlapSelector = option('contextmenu_avoid_overlap');

const isContextMenuDisabled = (editor: Editor): boolean =>
  getContextMenu(editor).length === 0;

const getContextMenu = (editor: Editor): string[] => {
  const contextMenus = editor.ui.registry.getAll().contextMenus;

  const contextMenu = editor.options.get('contextmenu');
  if (editor.options.isSet('contextmenu')) {
    return contextMenu;
  } else {
    // Filter default context menu items when they are not in the registry (e.g. when the plugin is not loaded)
    return Arr.filter(contextMenu, (item) => Obj.has(contextMenus, item));
  }
};

export {
  register,
  shouldNeverUseNative,
  getContextMenu,
  isContextMenuDisabled,
  getAvoidOverlapSelector
};
