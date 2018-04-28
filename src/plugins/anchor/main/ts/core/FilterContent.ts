/**
 * FilterContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isAnchorNode = function (node) {
  return !node.attr('href') && (node.attr('id') || node.attr('name')) && !node.firstChild;
};

const setContentEditable = function (state) {
  return function (nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (isAnchorNode(nodes[i])) {
        nodes[i].attr('contenteditable', state);
      }
    }
  };
};

const setup = function (editor) {
  editor.on('PreInit', function () {
    editor.parser.addNodeFilter('a', setContentEditable('false'));
    editor.serializer.addNodeFilter('a', setContentEditable(null));
  });
};

export default {
  setup
};