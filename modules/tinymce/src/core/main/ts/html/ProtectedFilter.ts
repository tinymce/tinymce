import { Arr } from '@ephox/katamari';

import type Editor from '../api/Editor';

const setupInputFiltering = (editor: Editor, protect: RegExp[]): void => {
  editor.on('BeforeSetContent', (e) => {
    Arr.each(protect, (pattern) => {
      e.content = e.content.replace(pattern, (str) => {
        return '<!--mce:protected ' + escape(str) + '-->';
      });
    });
  });
};

const setupOutputFiltering = (editor: Editor, protect: RegExp[]): void => {
  editor.serializer.addNodeFilter('#comment', (nodes) => {
    let i = nodes.length;
    while (i--) {
      const node = nodes[i];
      const value = node.value;

      if (value?.indexOf('mce:protected ') === 0) {
        const protectedHtml = unescape(value).substr(14);
        const valid = Arr.exists(protect, (pattern) => {
          const matches = protectedHtml.match(pattern);
          return matches !== null && matches[0].length === protectedHtml.length;
        });

        if (valid) {
          node.name = '#text';
          node.type = 3;
          node.raw = true;
          node.value = protectedHtml;
        } else {
          node.remove();
        }
      }
    }
  });
};

export const registerProtectedHtmlFilters = (editor: Editor, protect: RegExp[]): void => {
  setupInputFiltering(editor, protect);
  setupOutputFiltering(editor, protect);
};
