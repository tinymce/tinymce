import * as Words from '../words/Words';

type GetWordsApi = <T>(chars: T[], extract: (char: T) => string, options?: Words.WordOptions) => Words.Word<T>[];
const getWords: GetWordsApi = Words.getWords;

type GetWordsAndIndicesApi = <T>(chars: T[], extract: (char: T) => string, options?: Words.WordOptions) => Words.WordsWithIndices<T>;
const getWordsWithIndices: GetWordsAndIndicesApi = Words.getWordsWithIndices;

export {
  getWords,
  getWordsWithIndices
};
