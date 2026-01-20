import type Editor from 'tinymce/core/api/Editor';
import type { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import type { Toolbar } from 'tinymce/core/api/ui/Ui';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const register = (editor: Editor): void => {
  const setupHandler = (dir: 'ltr' | 'rtl') => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const nodeChangeHandler = (e: EditorEvent<NodeChangeEvent>) => {
      const block = editor.dom.isBlock(e.element) ? e.element : editor.dom.getParent(e.element, editor.dom.isBlock);
      if (block) {
        const direction = editor.dom.getStyle(block, 'direction') || editor.dom.getAttrib(block, 'dir');
        api.setActive(direction === dir);
      }
    };

    editor.on('NodeChange', nodeChangeHandler);
    return () => editor.off('NodeChange', nodeChangeHandler);
  };

  editor.ui.registry.addToggleButton('ltr', {
    tooltip: 'Left to right',
    icon: 'ltr',
    context: 'editable',
    onAction: () => editor.execCommand('mceDirectionLTR'),
    onSetup: setupHandler('ltr'),
  });

  editor.ui.registry.addToggleButton('rtl', {
    tooltip: 'Right to left',
    icon: 'rtl',
    context: 'editable',
    onAction: () => editor.execCommand('mceDirectionRTL'),
    onSetup: setupHandler('rtl')
  });
};

export {
  register
};
