import { Editor } from 'tinymce/core/api/Editor';

const patchPipeConfig = (config) => typeof config === 'string' ? config.split(/[ ,]/) : config;

const shouldNeverUseNative = function (editor: Editor): boolean {
  return editor.settings.contextmenu_never_use_native || false;
};

const getContextMenu = function (editor: Editor): string[] {
  const config = editor.getParam('contextmenu', 'link image imagetools table spellchecker');
  return patchPipeConfig(config);
};

export default {
  shouldNeverUseNative,
  getContextMenu
};