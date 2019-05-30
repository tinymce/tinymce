/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Node from 'tinymce/core/api/html/Node';
import Editor from 'tinymce/core/api/Editor';

const hasImageClass = (node: Node) => {
  const className = node.attr('class');
  return className && /\bimage\b/.test(className);
};

const toggleContentEditableState = (state: boolean) => {
  return (nodes: Node[]) => {
    let i = nodes.length;

    const toggleContentEditable = (node: Node) => {
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
};

const setup = (editor: Editor) => {
  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
    editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
  });
};

export default {
  setup
};