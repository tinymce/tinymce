import Extract from '../../extract/Extract';
import ExtractText from '../../extract/ExtractText';
import Find from '../../extract/Find';

var from = function (universe, item, optimise?) {
  return Extract.typed(universe, item, optimise);
};

var all = function (universe, item, optimise?) {
  return Extract.items(universe, item, optimise);
};

var extract = function (universe, child, offset, optimise?) {
  return Extract.extract(universe, child, offset, optimise);
};

var extractTo = function (universe, child, offset, pred, optimise?) {
  return Extract.extractTo(universe, child, offset, pred, optimise);
};

var find = function (universe, parent, offset, optimise?) {
  return Find.find(universe, parent, offset, optimise);
};

var toText = function (universe, item, optimise?) {
  return ExtractText.from(universe, item, optimise);
};

export default {
  extract,
  extractTo,
  all,
  from,
  find,
  toText,
};