import * as UnicodeData from './UnicodeData';
import { Arr } from '@ephox/katamari';

const SETS = UnicodeData.SETS;
const OTHER = UnicodeData.characterIndices.OTHER;

const getType = (char: string): number => {
  let j;
  let set;
  let type = OTHER;
  const setsLength = SETS.length;
  for (j = 0; j < setsLength; ++j) {
    set = SETS[j];

    if (set && set.test(char)) {
      type = j;
      break;
    }
  }
  return type;
};

const memoize = (func) => {
  const cache = {};

  return (char) => {
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