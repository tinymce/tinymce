import * as WordOptions from '../words/Words';

type GetWordsApi = <T>(chars: T[], extract: (char: T) => string, options?: WordOptions.WordOptions) => T[][];
const getWords: GetWordsApi = WordOptions.getWords;

type GetWordsAndIndicesApi = <T>(chars: T[], extract: (char: T) => string, options?: WordOptions.WordOptions) => WordOptions.WordsWithIndices<T>;
const getWordsAndIndices: GetWordsAndIndicesApi = WordOptions.getWordsAndIndices;

export {
  getWords,
  getWordsAndIndices
};
