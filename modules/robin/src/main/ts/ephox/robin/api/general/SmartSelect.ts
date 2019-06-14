import Selection from '../../smartselect/Selection';
import { Universe } from '@ephox/boss';

const word = function <E, D> (universe: Universe<E, D>, item: E, offset: number, optimise?: any) {
  return Selection.word(universe, item, offset);
};

export default {
  word
};