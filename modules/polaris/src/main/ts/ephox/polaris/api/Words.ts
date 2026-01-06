import * as Words from '../words/Words';

type GetWordsAndIndicesApi = <T>(chars: T[], extract: (char: T) => string, options?: Words.WordOptions) => Words.WordsWithIndices<T>;

type GetWordsApi = <T>(chars: T[], extract: (char: T) => string, options?: Words.WordOptions) => Words.Word<T>[];
const getWords: GetWordsApi = Words.getWords;

const getWordsWithIndices: GetWordsAndIndicesApi = Words.getWordsWithIndices;

export {
  getWords,
  getWordsWithIndices
};