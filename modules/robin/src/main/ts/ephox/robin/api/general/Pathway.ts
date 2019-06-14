import Simplify from '../../pathway/Simplify';
import { Universe } from '@ephox/boss';

/**
 * @see Simplify.simplify()
 */
const simplify = function <E, D> (universe: Universe<E, D>, elements: E[]) {
  return Simplify.simplify(universe, elements);
};

export default {
  simplify
};