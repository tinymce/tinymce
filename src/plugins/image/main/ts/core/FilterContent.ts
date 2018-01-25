/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const hasImageClass = function (node) {
  const className = node.attr('class');
  return className && /\bimage\b/.test(className);
};

const toggleContentEditableState = function (state) {
  return function (nodes) {
    let i = nodes.length, node;

    const toggleContentEditable = function (node) {
      node.attr('contenteditable', state ? 'true' : null);
    };

    while (i--) {
      node = nodes[i];

      if (hasImageClass(node)) {
        node.attr('contenteditable', state ? 'false' : null);
        Tools.each(node.getAll('figcaption'), toggleContentEditable);
      }
    }
  };
};

const setup = function (editor) {
  editor.on('preInit', function () {
    editor.parser.addNodeFilter('figure', toggleContentEditableState(true));
    editor.serializer.addNodeFilter('figure', toggleContentEditableState(false));
  });
};

export default {
  setup
};