import { Optional } from '@ephox/katamari';
import { Direction, SugarElement } from '@ephox/sugar';

import type { GeneralKeyingConfig, KeyRuleHandler } from '../keyboard/KeyingModeTypes';

export type ElementMover <C> = (elem: SugarElement<HTMLElement>, focused: SugarElement<HTMLElement>, config: C) => Optional<SugarElement<HTMLElement>>;

// Looks up direction (considering LTR and RTL), finds the focused element,
// and tries to move. If it succeeds, triggers focus and kills the event.
const useH = <C extends GeneralKeyingConfig>(movement: (elem: SugarElement<Element>) => ElementMover<C>): KeyRuleHandler<C> =>
  (component, event, config) => {
    const moveFunc = movement(component);
    return use(moveFunc, component, event, config);
  };

const west = <C extends GeneralKeyingConfig>(moveLeft: ElementMover<C>, moveRight: ElementMover<C>): KeyRuleHandler<C> => {
  const movement = Direction.onDirection(moveLeft, moveRight);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useH(movement);
};

const east = <C extends GeneralKeyingConfig>(moveLeft: ElementMover<C>, moveRight: ElementMover<C>): KeyRuleHandler<C> => {
  const movement = Direction.onDirection(moveRight, moveLeft);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useH(movement);
};

const useV = <C extends GeneralKeyingConfig>(moveFunc: ElementMover<C>): KeyRuleHandler<C> =>
  (component, event, config) => use(moveFunc, component, event, config);

const use = <C extends GeneralKeyingConfig>(moveFunc: ElementMover<C>, component: SugarElement<HTMLElement>, _event: Event, config: C): Optional<boolean> => {
  const outcome = config.focusManager.get(component).bind((focused) => moveFunc(component, focused, config));

  return outcome.map((newFocus): boolean => {
    config.focusManager.set(component, newFocus);
    return true;
  });
};

const north = useV;
const south = useV;
const move = useV;

export {
  east,
  west,
  north,
  south,
  move
};
