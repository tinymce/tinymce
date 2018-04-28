/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Parser from '../core/Parser';

const open = function (editor, headState) {
  const data = Parser.htmlToData(editor, headState.get());

  editor.windowManager.open({
    title: 'Document properties',
    data,
    defaults: { type: 'textbox', size: 40 },
    body: [
      { name: 'title', label: 'Title' },
      { name: 'keywords', label: 'Keywords' },
      { name: 'description', label: 'Description' },
      { name: 'robots', label: 'Robots' },
      { name: 'author', label: 'Author' },
      { name: 'docencoding', label: 'Encoding' }
    ],
    onSubmit (e) {
      const headHtml = Parser.dataToHtml(editor, Tools.extend(data, e.data), headState.get());
      headState.set(headHtml);
    }
  });
};

export default {
  open
};