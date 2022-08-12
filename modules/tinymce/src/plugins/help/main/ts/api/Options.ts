import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';
import { Dialog } from 'tinymce/core/api/ui/Ui';

export type HelpTabsSetting = (string | Dialog.TabSpec)[];

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('help_tabs', {
    processor: 'array'
  });
};

const getHelpTabs = option<HelpTabsSetting | undefined>('help_tabs');
const getForcedPlugins = option('forced_plugins');

export {
  register,
  getHelpTabs,
  getForcedPlugins
};
