import Editor from 'tinymce/core/api/Editor';

import { WordCountApi } from './Api';

const fireWordCountUpdate = (editor: Editor, api: WordCountApi): void => {
  editor.dispatch('wordCountUpdate', {
    wordCount: {
      words: api.body.getWordCount(),
      characters: api.body.getCharacterCount(),
      charactersWithoutSpaces: api.body.getCharacterCountWithoutSpaces()
    }
  });
};

export {
  fireWordCountUpdate
};
