import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { EmojiDatabase } from '../core/EmojiDatabase';
import { emojisFrom } from '../core/Lookup';

const init = (editor: Editor, database: EmojiDatabase): void => {
  editor.ui.registry.addAutocompleter('emoticons', {
    trigger: ':',
    columns: 'auto',
    minChars: 2,
    fetch: (pattern, maxResults) => database.waitForLoad().then(() => {
      const candidates = database.listAll();
      return emojisFrom(candidates, pattern, Optional.some(maxResults));
    }),
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
