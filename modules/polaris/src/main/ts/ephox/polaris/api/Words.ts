import { getWords as getWordsBase, WordOptions } from '../words/Words';

type GetWordsApi = <T>(chars: T[], extract: (char: T) => string, options?: WordOptions) => T[][];
const getWords: GetWordsApi = getWordsBase;

export {
  getWords
};