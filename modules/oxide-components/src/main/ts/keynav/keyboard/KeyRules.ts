import { Arr, Optional } from '@ephox/katamari';

import type { KeyRuleHandler } from './KeyingModeTypes';
import * as KeyMatch from './KeyMatch';

export interface KeyRule<C> {
  matches: KeyMatch.KeyMatcher;
  classification: KeyRuleHandler<C>;
}

const rule = <C>(matches: KeyMatch.KeyMatcher, action: KeyRuleHandler<C>): KeyRule<C> => ({
  matches,
  classification: action
});

const choose = <C>(transitions: Array<KeyRule<C>>, event: KeyboardEvent): Optional<KeyRuleHandler<C>> => {
  const transition = Arr.find(transitions, (t) => t.matches(event));

  return transition.map((t) => t.classification);
};

export {
  rule,
  choose
};
