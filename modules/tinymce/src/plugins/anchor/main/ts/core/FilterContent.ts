/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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