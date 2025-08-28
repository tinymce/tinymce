import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';

import { isEmptyString } from './Utils';

// Note: node.firstChild check is for the 'allow_html_in_named_anchor' setting
// Only want to add contenteditable attributes if there is no text within the anchor
const isNamedAnchorNode = (node: AstNode): boolean =>
  isEmptyString(node.attr('href')) && !isEmptyString(node.attr('id') || node.attr('name'));

const isEmptyNamedAnchorNode = (node: AstNode): boolean =>
  isNamedAnchorNode(node) && !node.firstChild;

const setContentEditable = (state: string | null) => (nodes: AstNode[]): void => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isEmptyNamedAnchorNode(node)) {
      node.attr('contenteditable', state);
    }
  }
};

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('a', setContentEditable('false'));
    editor.serializer.addNodeFilter('a', setContentEditable(null));
  });
};

export {
  setup
};
