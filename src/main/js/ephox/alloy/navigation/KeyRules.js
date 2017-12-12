import KeyMatch from './KeyMatch';
import { Arr } from '@ephox/katamari';

var basic = function (key, action) {
  return {
    matches: KeyMatch.is(key),
    classification: action
  };
};

var rule = function (matches, action) {
  return {
    matches: matches,
    classification: action
  };
};

var choose = function (transitions, event) {
  var transition = Arr.find(transitions, function (t) {
    return t.matches(event);
  });

  return transition.map(function (t) {
    return t.classification;
  });
};

export default <any> {
  basic: basic,
  rule: rule,
  choose: choose
};