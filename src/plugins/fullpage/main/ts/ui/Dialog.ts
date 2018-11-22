/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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