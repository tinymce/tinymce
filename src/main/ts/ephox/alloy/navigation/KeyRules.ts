import { Arr, Option } from '@ephox/katamari';

import * as KeyMatch from './KeyMatch';

const basic = function (key, action) {
  return {
    matches: KeyMatch.is(key),
    classification: action
  };
};

const rule = function (matches, action) {
  return {
    matches,
    classification: action
  };
};

const choose = function (transitions, event) {
  const transition = Arr.find(transitions, function (t) {
    return t.matches(event);
  });

  return transition.map(function (t) {
    return t.classification;
  });
};

export {
  basic,
  rule,
  choose
};