import { Singleton } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Toolbar, Menu } from 'tinymce/core/api/ui/Ui';

import { FormatterFormatItem } from './complex/BespokeSelect';

const composeUnbinders = (f: VoidFunction, g: VoidFunction): VoidFunction => () => {
  f();
  g();
};

const onSetupEditableToggle = <T extends Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi>(editor: Editor): (api: T) => VoidFunction =>
  onSetupEvent<T>(editor, 'NodeChange', (api) => {
    api.setEnabled(editor.selection.isEditable());
  });

const onSetupFormatToggle = (editor: Editor, name: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi): VoidFunction => {
  const boundFormatChangeCallback = Singleton.unbindable();

  const init = () => {
    api.setActive(editor.formatter.match(name));
    const binding = editor.formatter.formatChanged(name, api.setActive);
    boundFormatChangeCallback.set(binding);
  };

  // The editor may or may not have been setup yet, so check for that
  editor.initialized ? init() : editor.once('init', init);

  return () => {
    editor.off('init', init);
    boundFormatChangeCallback.clear();
  };
};

const onSetupStateToggle = (editor: Editor, name: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi): VoidFunction => {
  const unbindEditableToogle = onSetupEditableToggle(editor)(api);
  const unbindFormatToggle = onSetupFormatToggle(editor, name)(api);

  return () => {
    unbindEditableToogle();
    unbindFormatToggle();
  };
};

const onSetupEvent = <T>(editor: Editor, event: string, f: (api: T) => void) => (api: T): VoidFunction => {
  const handleEvent = () => f(api);

  const init = () => {
    f(api);
    editor.on(event, handleEvent);
  };

  // The editor may or may not have been setup yet, so check for that
  editor.initialized ? init() : editor.once('init', init);

  return () => {
    editor.off('init', init);
    editor.off(event, handleEvent);
  };
};

const onActionToggleFormat = (editor: Editor) => (rawItem: FormatterFormatItem) => (): void => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.execCommand('mceToggleFormat', false, rawItem.format);
  });
};

const onActionExecCommand = (editor: Editor, command: string) =>
  (): boolean => editor.execCommand(command);

export {
  composeUnbinders,
  onSetupEvent,
  onSetupStateToggle,
  onSetupEditableToggle,
  onActionToggleFormat,
  onActionExecCommand
};
