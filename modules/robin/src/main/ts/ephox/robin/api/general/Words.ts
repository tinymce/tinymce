import { Universe } from '@ephox/boss';

import { WordScope } from '../../data/WordScope';
import * as WordUtil from '../../util/WordUtil';
import * as Identify from '../../words/Identify';

const identify = (allText: string): WordScope[] => {
  return Identify.words(allText);
};

const isWord = (_universe: Universe<any, any>, text: string): boolean => {
  return !WordUtil.hasBreak(text);
};

export {
  WordScope,
  identify,
  isWord
};
