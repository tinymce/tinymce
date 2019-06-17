/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import Scan from '../core/Scan';
import { CharMap } from '../core/CharMap';

const init = (editor: Editor, all: CharMap) => {
  editor.ui.registry.addAutocompleter('charmap', {
    ch: ':',
    columns: 'auto',
    minChars: 2,
    fetch: (pattern, maxResults) => {
      return new Promise((resolve, reject) => {
        resolve(Scan.scan(all, pattern));
      });
    },
    onAction: (autocompleteApi, rng, value) => {
      editor.selection.setRng(rng);
      editor.insertContent(value);
      autocompleteApi.hide();
    }
  });
};

export {
  init
};