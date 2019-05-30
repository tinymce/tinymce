/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import { emojisFrom } from '../core/Lookup';
import { EmojiDatabase } from '../core/EmojiDatabase';

const init = (editor: Editor, database: EmojiDatabase): void => {
  editor.ui.registry.addAutocompleter('emoticons', {
    ch: ':',
    columns: 'auto',
    minChars: 2,
    fetch: (pattern, maxResults) => {
      return database.waitForLoad().then(() => {
        const candidates = database.listAll();
        return emojisFrom(candidates, pattern, Option.some(maxResults));
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