import { Option } from '@ephox/katamari';
import { Direction, Element } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import { GeneralKeyingConfig, KeyRuleHandler } from '../keying/KeyingModeTypes';

export type ElementMover <C, S> = (elem: Element, focused: Element, config: C, state: S) => Option<Element>;

// Looks up direction (considering LTR and RTL), finds the focused element,
// and tries to move. If it succeeds, triggers focus and kills the event.
const useH = <C extends GeneralKeyingConfig, S>(movement: (elem: Element) => ElementMover<C, S>): KeyRuleHandler<C, S> => (component, simulatedEvent, config, state) => {
  const move = movement(component.element());
  return use(move, component, simulatedEvent, config, state);
};

const west = <C extends GeneralKeyingConfig, S>(moveLeft: ElementMover<C, S>, moveRight: ElementMover<C, S>): KeyRuleHandler<C, S> => {
  const movement = Direction.onDirection(moveLeft, moveRight);
  return useH(movement);
};

const east = <C extends GeneralKeyingConfig, S>(moveLeft: ElementMover<C, S>, moveRight: ElementMover<C, S>) => {
  const movement = Direction.onDirection(moveRight, moveLeft);
  return useH(movement);
};

const useV = <C extends GeneralKeyingConfig, S>(move: ElementMover<C, S>): KeyRuleHandler<C, S> => (component, simulatedEvent, config, state) => use(move, component, simulatedEvent, config, state);

const use = <C extends GeneralKeyingConfig, S>(move: ElementMover<C, S>, component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, config: C, state: S): Option<boolean> => {
  const outcome = config.focusManager.get(component).bind((focused) => move(component.element(), focused, config, state));

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
