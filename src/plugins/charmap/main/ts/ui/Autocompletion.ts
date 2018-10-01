import { Editor } from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import Scan from '../core/Scan';

const init = (editor: Editor, all) => {
  editor.ui.registry.addAutocompleter('charmap', {
    ch: ':',
    columns: 'auto',
    fetch: (pattern, maxResults) => {
      return new Promise((resolve, reject) => {
        resolve(Scan.scan(all, pattern.toLowerCase()));
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