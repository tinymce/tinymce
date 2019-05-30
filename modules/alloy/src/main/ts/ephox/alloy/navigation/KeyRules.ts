import { Arr, Option } from '@ephox/katamari';

import { SugarEvent } from '../alien/TypeDefinitions';
import { KeyRuleHandler } from '../keying/KeyingModeTypes';
import * as KeyMatch from './KeyMatch';

export interface KeyRule<C, S> {
  matches: KeyMatch.KeyMatcher;
  classification: KeyRuleHandler<C, S>;
}

const basic = <C, S>(key: number, action: KeyRuleHandler<C, S>): KeyRule<C, S> => {
  return {
    matches: KeyMatch.is(key),
    classification: action
  };
};

const rule = <C, S>(matches: KeyMatch.KeyMatcher, action: KeyRuleHandler<C, S>): KeyRule<C, S> => {
  return {
    matches,
    classification: action
  };
};

const choose = <C, S>(transitions: Array<KeyRule<C, S>>, event: SugarEvent): Option<KeyRuleHandler<C, S>> => {
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