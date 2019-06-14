import WordUtil from '../../util/WordUtil';
import Identify from '../../words/Identify';
import { Universe } from '@ephox/boss';

const identify = function (allText: string) {
  return Identify.words(allText);
};

const isWord = function (_universe: Universe<any, any>, text: string) {
  return !WordUtil.hasBreak(text);
};

export default {
  identify,
  isWord
};