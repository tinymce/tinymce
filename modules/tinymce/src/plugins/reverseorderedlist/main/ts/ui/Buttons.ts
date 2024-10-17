import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import { Reverser } from '../core/Types';

const register = (editor: Editor, reverser: Reverser): void => {
  const onAction = (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    editor.execCommand('reverseOrderedList');
    api.setActive(reverser.isInReversedOrderedList());
  };

  const onSetup = (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const activate = () => api.setActive(reverser.isInReversedOrderedList());
    editor.on('NodeChange', activate);
    return () => editor.off('NodeChange', activate);
  };

  editor.ui.registry.addContext('parent', (value) => {
    const node = editor.selection.getNode();
    return editor.dom.is(node, value + ' *');
  });

  editor.ui.registry.addToggleButton('reverseorderedlist', {
    text: 'Reverse list!',
    context: 'parent:ol',
    tooltip: 'Test plugin',
    onAction,
    onSetup
  });
};

export {
  register
};
