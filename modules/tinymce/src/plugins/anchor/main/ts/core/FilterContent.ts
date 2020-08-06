/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Node from 'tinymce/core/api/html/Node';
import Editor from 'tinymce/core/api/Editor';
import { isEmptyString } from './Utils';

// Note: node.firstChild check is for the 'allow_html_in_named_anchor' setting
// Only want to add contenteditable attributes if there is no text within the anchor
const isNamedAnchorNode = (node: Node) => node && isEmptyString(node.attr('href')) && !isEmptyString(node.attr('id') || node.attr('name'));
const isEmptyNamedAnchorNode = (node: Node) => isNamedAnchorNode(node) && !node.firstChild;

const setContentEditable = (state: string | null) => (nodes: Node[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isEmptyNamedAnchorNode(node)) {
      node.attr('contenteditable', state);
    }
  }
};

const setup = (editor: Editor) => {
  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('a', setContentEditable('false'));
    editor.serializer.addNodeFilter('a', setContentEditable(null));
  });
};

export {
  setup
};
