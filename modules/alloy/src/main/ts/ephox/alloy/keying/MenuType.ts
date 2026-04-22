import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import type { AlloyComponent } from '../api/component/ComponentApi';
import { NoState, type Stateless } from '../behaviour/common/BehaviourState';
import * as DomMovement from '../navigation/DomMovement';
import * as DomNavigation from '../navigation/DomNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';

import type { KeyRuleHandler, MenuConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.required('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
];

const execute: KeyRuleHandler<MenuConfig, Stateless> = (component, simulatedEvent, menuConfig) => menuConfig.focusManager.get(component).bind((focused) => menuConfig.execute(component, simulatedEvent, focused));

const focusIn = (component: AlloyComponent, menuConfig: MenuConfig, _state: Stateless): void => {
  // Maybe keep selection if it was there before
  SelectorFind.descendant<HTMLElement>(component.element, menuConfig.selector).each((first) => {
    menuConfig.focusManager.set(component, first);
  });
};

const moveUp: DomMovement.ElementMover<MenuConfig, Stateless> = (element, focused, info) => DomNavigation.horizontal(element, info.selector, focused, -1);

const moveDown: DomMovement.ElementMover<MenuConfig, Stateless> = (element, focused, info) => DomNavigation.horizontal(element, info.selector, focused, +1);

const getKeydownRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.UP), DomMovement.move(moveUp)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN), DomMovement.move(moveDown)),
  KeyRules.rule(KeyMatch.inSet(Keys.ENTER), execute),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE), execute)
]);

const getKeyupRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE), KeyingTypes.stopEventForFirefox)
]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Optional.some(focusIn));
