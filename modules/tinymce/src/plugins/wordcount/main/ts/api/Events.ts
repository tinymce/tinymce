/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { WordCountApi } from './Api';

const fireWordCountUpdate = (editor: Editor, api: WordCountApi) => {
  editor.fire('wordCountUpdate', {
    wordCount: {
      words: api.body.getWordCount(),
      characters: api.body.getCharacterCount(),
      charactersWithoutSpaces: api.body.getCharacterCountWithoutSpaces(),
    }
  });
};

export {
  fireWordCountUpdate
};