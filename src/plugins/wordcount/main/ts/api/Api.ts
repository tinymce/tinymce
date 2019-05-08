/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as WordCount from '../text/WordCount';
import Editor from 'tinymce/core/api/Editor';

export interface WordCountApi {
  getCount: () => number;
  getCharacterCount: () => number;
  getCharacterCountNoSpaces: () => number;
}

const get = (editor: Editor): WordCountApi => {
  const getCount = () => {
    return WordCount.getEditorCount(editor).words;
  };

  const getCharacterCount = () => {
    return WordCount.getEditorCount(editor).characters;
  };

  const getCharacterCountNoSpaces = () => {
    return WordCount.getEditorCount(editor).charactersNoSpace;
  };

  return {
    getCount,
    getCharacterCount,
    getCharacterCountNoSpaces
  };
};

export {
  get
};