import { Direction } from '@ephox/sugar';

// Looks up direction (considering LTR and RTL), finds the focused element,
// and tries to move. If it succeeds, triggers focus and kills the event.
const useH = function (movement) {
  return function (component, simulatedEvent, config, state) {
    const move = movement(component.element());
    return use(move, component, simulatedEvent, config, state);
  };
};

const west = function (moveLeft, moveRight) {
  const movement = Direction.onDirection(moveLeft, moveRight);
  return useH(movement);
};

const east = function (moveLeft, moveRight) {
  const movement = Direction.onDirection(moveRight, moveLeft);
  return useH(movement);
};

const useV = function (move) {
  return function (component, simulatedEvent, config, state) {
    return use(move, component, simulatedEvent, config, state);
  };
};

const use = function (move, component, simulatedEvent, config, state) {
  const outcome = config.focusManager().get(component).bind(function (focused) {
    return move(component.element(), focused, config, state);
  });

  return outcome.map(function (newFocus) {
    config.focusManager().set(component, newFocus);
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