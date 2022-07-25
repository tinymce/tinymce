import Editor from 'tinymce/core/api/Editor';

import * as CharMap from '../core/CharMap';
import * as Scan from '../core/Scan';

type CharMap = CharMap.CharMap;

const init = (editor: Editor, all: CharMap): void => {
  editor.ui.registry.addAutocompleter('charmap', {
    trigger: ':',
    columns: 'auto',
    minChars: 2,
    fetch: (pattern, _maxResults) => new Promise((resolve, _reject) => {
      resolve(Scan.scan(all, pattern));
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
