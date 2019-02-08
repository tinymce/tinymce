import Sanitise from '../string/Sanitise';
import Split from '../string/Split';

const splits = function (text, points) {
  return Split.splits(text, points);
};

const cssSanitise = function (str) {
  return Sanitise.css(str);
};

export default {
  cssSanitise,
  splits
};