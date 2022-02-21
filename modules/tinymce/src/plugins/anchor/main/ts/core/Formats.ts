import Editor from 'tinymce/core/api/Editor';

import * as Utils from './Utils';

const registerFormats = (editor: Editor): void => {
  editor.formatter.register('namedAnchor', {
    inline: 'a',
    selector: Utils.namedAnchorSelector,
    remove: 'all',
    split: true,
    deep: true,
    attributes: {
      id: '%value'
    },
    onmatch: (node: Node, _fmt, _itemName: string) => {
      return Utils.isNamedAnchor(node);
    }
  });
};

export {
  registerFormats
};
