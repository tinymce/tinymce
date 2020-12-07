import { Universe } from '@ephox/boss';
import { WordScope } from '../../data/WordScope';
import * as WordUtil from '../../util/WordUtil';
import * as Identify from '../../words/Identify';

const identify = function (allText: string): WordScope[] {
  return Identify.words(allText);
};

const isWord = function (_universe: Universe<any, any>, text: string): boolean {
  return !WordUtil.hasBreak(text);
};

export {
  identify,
  isWord
};
