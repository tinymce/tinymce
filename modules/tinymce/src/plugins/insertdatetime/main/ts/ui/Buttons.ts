import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';
import * as Actions from '../core/Actions';

const onSetupEditable = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable());
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const register = (editor: Editor): void => {
  const formats = Options.getFormats(editor);
  const defaultFormat = Cell(Options.getDefaultDateTime(editor));

  const insertDateTime = (format: string) => editor.execCommand('mceInsertDate', false, format);

  editor.ui.registry.addSplitButton('insertdatetime', {
    icon: 'insert-time',
    tooltip: 'Insert date/time',
    select: (value) => value === defaultFormat.get(),
    fetch: (done) => {
      done(Tools.map(formats, (format): Menu.ChoiceMenuItemSpec =>
        ({ type: 'choiceitem', text: Actions.getDateTime(editor, format), value: format })
      ));
    },
    onAction: (_api) => {
      insertDateTime(defaultFormat.get());
    },
    onItemAction: (_api, value) => {
      defaultFormat.set(value);
      insertDateTime(value);
    },
    onSetup: onSetupEditable(editor)
  });

  const makeMenuItemHandler = (format: string) => (): void => {
    defaultFormat.set(format);
    insertDateTime(format);
  };

  editor.ui.registry.addNestedMenuItem('insertdatetime', {
    icon: 'insert-time',
    text: 'Date/time',
    getSubmenuItems: () => Tools.map(formats, (format): Menu.MenuItemSpec => ({
      type: 'menuitem',
      text: Actions.getDateTime(editor, format),
      onAction: makeMenuItemHandler(format)
    })),
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
