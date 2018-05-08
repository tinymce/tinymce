/**
 * DetailsElement.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Arr, Type } from '@ephox/katamari';

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