import { Arr, Option } from '@ephox/katamari';

import * as KeyMatch from './KeyMatch';

const basic = (key, action) => {
  return {
    matches: KeyMatch.is(key),
    classification: action
  };
};

const rule = (matches, action) => {
  return {
    matches,
    classification: action
  };
};

const choose = (transitions, event) => {
  const transition = Arr.find(transitions, (t) => {
    return t.matches(event);
  });

  return transition.map((t) => {
    return t.classification;
  });
};

export {
  basic,
  rule,
  choose
};