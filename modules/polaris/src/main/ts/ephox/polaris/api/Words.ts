import * as WordOptions from '../words/Words';

type GetWordsApi = <T>(chars: T[], extract: (char: T) => string, options?: WordOptions.WordOptions) => T[][];
const getWords: GetWordsApi = WordOptions.getWords;

export {
  getWords
};
