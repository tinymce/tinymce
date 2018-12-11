import { Arr, Option } from '@ephox/katamari';

import { SugarEvent } from '../alien/TypeDefinitions';
import { KeyRuleHandler } from '../keying/KeyingModeTypes';
import * as KeyMatch from './KeyMatch';

export enum KeyScope {
  InternalScope = 'internal',
  ExternalScope = 'external',
  BothScope = 'both'
};

export interface KeyRule<C, S> {
  matches: KeyMatch.KeyMatcher;
  scope: KeyScope;
  classification: KeyRuleHandler<C, S>;
}

const basic = <C, S>(key: number, scope: KeyScope, action: KeyRuleHandler<C, S>): KeyRule<C, S> => {
  return {
    matches: KeyMatch.is(key),
    scope,
    classification: action
  };
};

const rule = <C, S>(matches: KeyMatch.KeyMatcher, scope: KeyScope, action: KeyRuleHandler<C, S>): KeyRule<C, S> => {
  return {
    matches,
    scope,
    classification: action
  };
};

const choose = <C, S>(isInternal: boolean, transitions: Array<KeyRule<C, S>>, event: SugarEvent): Option<KeyRuleHandler<C, S>> => {

  const hasRightScope = (scope: KeyScope): boolean => {
    if (scope === KeyScope.InternalScope) return isInternal;
    if (scope === KeyScope.ExternalScope) return !isInternal;
    return true;
  }

  const transition = Arr.find(transitions, (t) => {
    return hasRightScope(t.scope) && t.matches(event);
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