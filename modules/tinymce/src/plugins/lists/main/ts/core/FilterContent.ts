import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';

const isTextNode = (node: AstNode) => node.type === 3;
const isEmpty = (nodeBuffer: AstNode[]) => nodeBuffer.length === 0;

const wrapInvalidChildren = (list: AstNode) => {
  const insertListItem = (buffer: AstNode[], refNode?: AstNode) => {
    const li = AstNode.create('li');
    Arr.each(buffer, (node) => li.append(node));
    if (refNode) {
      list.insert(li, refNode, true);
    } else {
      list.append(li);
    }
  };

  const reducer = (buffer: AstNode[], node: AstNode): AstNode[] => {
    if (isTextNode(node)) {
      return [ ...buffer, node ];
    } else if (!isEmpty(buffer) && !isTextNode(node)) {
      insertListItem(buffer, node);
      return [];
    } else {
      return buffer;
    }
  };

  const restBuffer = Arr.foldl(list.children(), reducer, []);
  if (!isEmpty(restBuffer)) {
    insertListItem(restBuffer);
  }
};

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    const { parser } = editor;
    parser.addNodeFilter('ul,ol', (nodes) => Arr.each(nodes, wrapInvalidChildren));
  });
};

export {
  setup
};
