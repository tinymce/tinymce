/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import Node from 'tinymce/core/api/html/Node';
import Editor from 'tinymce/core/api/Editor';

const isAnchorNode = (node: Node) => {
  return !node.attr('href') && (node.attr('id') || node.attr('name'));
};

const setContentEditable = (state: string | null) => (nodes: Node[]) =>
  Arr.each((nodes), (node) => {
    if (isAnchorNode(node)) {
      node.attr('contenteditable', state);
    }
  });

const setup = (editor: Editor) => {
  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('a', setContentEditable('false'));
    editor.serializer.addNodeFilter('a', setContentEditable(null));
  });
};

export default {
  setup
};
