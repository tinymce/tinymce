/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

export const setup = (editor: Editor) => {
  editor.on('PreInit', () => {
    editor.parser.addAttributeFilter('data-emoticon', (nodes) => {
      Arr.each(nodes, (node) => {
        node.attr('data-mce-resize', 'false');
        node.attr('data-mce-placeholder', '1');
      });
    });
  });
};
