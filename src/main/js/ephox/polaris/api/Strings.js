import Sanitise from '../string/Sanitise';
import Split from '../string/Split';

var splits = function (text, points) {
  return Split.splits(text, points);
};

var cssSanitise = function (str) {
  return Sanitise.css(str);
};

export default <any> {
  cssSanitise: cssSanitise,
  splits: splits
};