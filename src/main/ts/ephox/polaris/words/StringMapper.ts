import * as UnicodeData from './UnicodeData';
import { Arr } from '@ephox/katamari';

const SETS = UnicodeData.SETS;
const OTHER = UnicodeData.characterIndices.OTHER;

const getType = (char: string): number => {
  let type = OTHER;
  const setsLength = SETS.length;
  for (let j = 0; j < setsLength; ++j) {
    const set = SETS[j];

    if (set && set.test(char)) {
      type = j;
      break;
    }
  }
  return type;
};

const memoize = <R> (func: (char: string) => R) => {
  const cache: Record<string, R> = {};

  return (char: string) => {
    if (cache[char]) {
      return cache[char];
    } else {
      const result = func(char);
      cache[char] = result;
      return result;
    }
  };
};

export type CharacterMap = number[];

const classify = (characters: string[]): CharacterMap => {
  const memoized = memoize(getType);
  return Arr.map(characters, memoized);
};

export {
  classify
};