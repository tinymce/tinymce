/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { countWords, countCharacters, countCharactersWithoutSpaces, Counter } from '../core/Count';

export type CountGetter = () => number;

interface CountGetters {
  getWordCount: CountGetter;
  getCharacterCount: CountGetter;
  getCharacterCountWithoutSpaces: CountGetter;
}

export interface WordCountApi {
  body: CountGetters;
  selection: CountGetters;
  getCount: CountGetter; // TODO: Deprecate
}

const createBodyCounter = (editor: Editor, count: Counter): CountGetter => () => count(editor.getBody(), editor.schema);

const createSelectionCounter = (editor: Editor, count: Counter): CountGetter => () => count(editor.selection.getRng().cloneContents(), editor.schema);

const createBodyWordCounter = (editor: Editor): CountGetter => createBodyCounter(editor, countWords);

const get = (editor: Editor): WordCountApi => ({
  body: {
    getWordCount: createBodyWordCounter(editor),
    getCharacterCount: createBodyCounter(editor, countCharacters),
    getCharacterCountWithoutSpaces: createBodyCounter(editor, countCharactersWithoutSpaces)
  },
  selection: {
    getWordCount: createSelectionCounter(editor, countWords),
    getCharacterCount: createSelectionCounter(editor, countCharacters),
    getCharacterCountWithoutSpaces: createSelectionCounter(editor, countCharactersWithoutSpaces)
  },
  getCount: createBodyWordCounter(editor)
});

export {
  get
};