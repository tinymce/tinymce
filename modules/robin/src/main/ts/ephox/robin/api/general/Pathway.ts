import { Universe } from '@ephox/boss';
import * as Simplify from '../../pathway/Simplify';

type SimplifyFn = <E, D>(universe: Universe<E, D>, elements: E[]) => E[];

/**
 * @see Simplify.simplify()
 */
const simplify: SimplifyFn = Simplify.simplify;

export {
  simplify
};
