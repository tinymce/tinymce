import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

export const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    editor.parser.addAttributeFilter('data-emoticon', (nodes) => {
      Arr.each(nodes, (node) => {
        node.attr('data-mce-resize', 'false');
        node.attr('data-mce-placeholder', '1');
      });
    });
  });
};
