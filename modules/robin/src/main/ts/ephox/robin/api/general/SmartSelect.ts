import Selection from '../../smartselect/Selection';
import { Universe } from '@ephox/boss';

// The optimise parameter is no longer required in this API.
// Remove optimise as a code quality task: TBIO-4356
const word = function <E, D> (universe: Universe<E, D>, item: E, offset: number, optimise?: any) {
  return Selection.word(universe, item, offset);
};

export default {
  word
};