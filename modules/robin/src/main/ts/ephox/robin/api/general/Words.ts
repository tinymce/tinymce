import { Universe } from '@ephox/boss';
import * as WordUtil from '../../util/WordUtil';
import * as Identify from '../../words/Identify';

const identify = function (allText: string) {
  return Identify.words(allText);
};

const isWord = function (_universe: Universe<any, any>, text: string) {
  return !WordUtil.hasBreak(text);
};

export {
  identify,
  isWord
};
