import Editor from 'tinymce/core/api/Editor';

import { countCharacters, countCharactersWithoutSpaces, Counter, countWords } from '../core/Count';

export type CountGetter = () => number;

interface CountGetters {
  readonly getWordCount: CountGetter;
  readonly getCharacterCount: CountGetter;
  readonly getCharacterCountWithoutSpaces: CountGetter;
}

export interface WordCountApi {
  readonly body: CountGetters;
  readonly selection: CountGetters;
  readonly getCount: CountGetter; // TODO: Deprecate
}

const createBodyCounter = (editor: Editor, count: Counter): CountGetter => (): number =>
  count(editor.getBody(), editor.schema);

const createSelectionCounter = (editor: Editor, count: Counter): CountGetter => (): number =>
  count(editor.selection.getRng().cloneContents(), editor.schema);

const createBodyWordCounter = (editor: Editor): CountGetter =>
  createBodyCounter(editor, countWords);

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
