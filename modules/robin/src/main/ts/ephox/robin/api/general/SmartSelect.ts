import Selection from '../../smartselect/Selection';

var word = function (universe, item, offset, optimise) {
  return Selection.word(universe, item, offset, optimise);
};

export default <any> {
  word: word
};