import { Editor } from 'tinymce/core/api/Editor';

import { emojisFrom } from '../core/Lookup';
import { EmojiDatabase } from '../core/EmojiDatabase';
import { Option } from '@ephox/katamari';

const init = (editor: Editor, database: EmojiDatabase): void => {
  editor.ui.registry.addAutocompleter('emoticons', {
    ch: ':',
    columns: 'auto',
    fetch: (pattern, maxResults) => {
      return database.waitForLoad().then(() => {
        const candidates = database.listAll();
        return emojisFrom(candidates, pattern.toLowerCase(), Option.some(maxResults));
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