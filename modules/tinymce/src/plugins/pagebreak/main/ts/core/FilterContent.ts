/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from 'tinymce/core/api/Env';
import * as Settings from '../api/Settings';

const getPageBreakClass = function () {
  return 'mce-pagebreak';
};

const getPlaceholderHtml = function () {
  return '<img src="' + Env.transparentSrc + '" class="' + getPageBreakClass() + '" data-mce-resize="false" data-mce-placeholder />';
};

const setup = function (editor) {
  const separatorHtml = Settings.getSeparatorHtml(editor);

  const pageBreakSeparatorRegExp = new RegExp(separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function (a) {
    return '\\' + a;
  }), 'gi');

  editor.on('BeforeSetContent', function (e) {
    e.content = e.content.replace(pageBreakSeparatorRegExp, getPlaceholderHtml());
  });

  editor.on('PreInit', function () {
    editor.serializer.addNodeFilter('img', function (nodes) {
      let i = nodes.length, node, className;

      while (i--) {
        node = nodes[i];
        className = node.attr('class');
        if (className && className.indexOf('mce-pagebreak') !== -1) {
          // Replace parent block node if pagebreak_split_block is enabled
          const parentNode = node.parent;
          if (editor.schema.getBlockElements()[parentNode.name] && Settings.shouldSplitBlock(editor)) {
            parentNode.type = 3;
            parentNode.value = separatorHtml;
            parentNode.raw = true;
            node.remove();
            continue;
          }

          node.type = 3;
          node.value = separatorHtml;
          node.raw = true;
        }
      }
    });
  });
};

export {
  setup,
  getPlaceholderHtml,
  getPageBreakClass
};
