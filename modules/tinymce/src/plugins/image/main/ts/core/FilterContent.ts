import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import Tools from 'tinymce/core/api/util/Tools';

const hasImageClass = (node: AstNode): boolean => {
  const className = node.attr('class');
  return Type.isNonNullable(className) && /\bimage\b/.test(className);
};

const toggleContentEditableState = (state: boolean) => (nodes: AstNode[]): void => {
  let i = nodes.length;

  const toggleContentEditable = (node: AstNode) => {
    node.attr('contenteditable', state ? 'true' : null);
  };

  while (i--) {
    const node = nodes[i];

    if (hasImageClass(node)) {
      node.attr('contenteditable', state ? 'false' : null);
      Tools.each(node.getAll('figcaption'), toggleContentEditable);
    }
  }
};

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
    editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
  });
};

export {
  setup
};
