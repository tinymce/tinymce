/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';
import Editor from '../api/Editor';

const preventSummaryToggle = (editor: Editor) => {
  editor.on('click', (e) => {
    if (editor.dom.getParent(e.target, 'details')) {
      e.preventDefault();
    }
  });
};

// Forces the details element to always be open within the editor
const filterDetails = (editor: Editor) => {
  editor.parser.addNodeFilter('details', function (elms) {
    Arr.each(elms, function (details) {
      details.attr('data-mce-open', details.attr('open'));
      details.attr('open', 'open');
    });
  });

  editor.serializer.addNodeFilter('details', function (elms) {
    Arr.each(elms, function (details) {
      const open = details.attr('data-mce-open');
      details.attr('open', Type.isString(open) ? open : null);
      details.attr('data-mce-open', null);
    });
  });
};

const setup = (editor: Editor) => {
  preventSummaryToggle(editor);
  filterDetails(editor);
};

export {
  setup
};