import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

type ControlApi = Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi;

const onSetupEditable = <T extends ControlApi>(editor: Editor, onChanged: (api: T) => void = Fun.noop) => (api: T): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable());
    onChanged(api);
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const isCodeSampleSelection = (editor: Editor): boolean => {
  const node = editor.selection.getStart();
  return editor.dom.is(node, 'pre[class*="language-"]');
};

const register = (editor: Editor): void => {

  const onAction = () => editor.execCommand('codesample');

  editor.ui.registry.addToggleButton('codesample', {
    icon: 'code-sample',
    tooltip: 'Insert/edit code sample',
    onAction,
    onSetup: onSetupEditable(editor, (api) => {
      api.setActive(isCodeSampleSelection(editor));
    })
  });

  editor.ui.registry.addMenuItem('codesample', {
    text: 'Code sample...',
    icon: 'code-sample',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
