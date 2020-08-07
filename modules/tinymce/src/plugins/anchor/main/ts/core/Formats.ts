/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import * as Utils from './Utils';

const registerFormats = (editor: Editor) => {
  editor.formatter.register('namedAnchor', {
    inline: 'a',
    selector: Utils.namedAnchorSelector,
    remove: 'all',
    split: true,
    deep: true,
    attributes: {
      id: '%value'
    },
    onmatch(node: Node, _fmt, _itemName: string) {
      return Utils.isNamedAnchor(node);
    }
  });
};

export {
  registerFormats
};
