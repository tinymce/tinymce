import Simplify from '../../pathway/Simplify';

/**
 * @see Simplify.simplify()
 */
var simplify = function (universe, elements) {
  return Simplify.simplify(universe, elements);
};

export default <any> {
  simplify: simplify
};