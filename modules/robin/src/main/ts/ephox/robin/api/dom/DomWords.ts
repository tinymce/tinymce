import { DomUniverse } from '@ephox/boss';
import { WordScope } from '../../data/WordScope';
import * as Words from '../general/Words';

const universe = DomUniverse();

const identify = function (allText: string): WordScope[] {
  return Words.identify(allText);
};

const isWord = function (text: string): boolean {
  return Words.isWord(universe, text);
};

export {
  identify,
  isWord
};
