import { Arr, Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import { KeyRuleHandler } from '../keying/KeyingModeTypes';
import * as KeyMatch from './KeyMatch';

export interface KeyRule<C, S> {
  matches: KeyMatch.KeyMatcher;
  classification: KeyRuleHandler<C, S>;
}

const basic = <C, S>(key: number, action: KeyRuleHandler<C, S>): KeyRule<C, S> => ({
  matches: KeyMatch.is(key),
  classification: action
});

const rule = <C, S>(matches: KeyMatch.KeyMatcher, action: KeyRuleHandler<C, S>): KeyRule<C, S> => ({
  matches,
  classification: action
});

const choose = <C, S>(transitions: Array<KeyRule<C, S>>, event: EventArgs<KeyboardEvent>): Optional<KeyRuleHandler<C, S>> => {
  const transition = Arr.find(transitions, (t) => t.matches(event));

  return transition.map((t) => t.classification);
};

export {
  basic,
  rule,
  choose
};
