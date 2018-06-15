import { Direction } from '@ephox/sugar';

// Looks up direction (considering LTR and RTL), finds the focused element,
// and tries to move. If it succeeds, triggers focus and kills the event.
const useH = (movement) => {
  return (component, simulatedEvent, config, state?) => {
    const move = movement(component.element());
    return use(move, component, simulatedEvent, config, state);
  };
};

const west = (moveLeft, moveRight) => {
  const movement = Direction.onDirection(moveLeft, moveRight);
  return useH(movement);
};

const east = (moveLeft, moveRight) => {
  const movement = Direction.onDirection(moveRight, moveLeft);
  return useH(movement);
};

const useV = (move) => {
  return (component, simulatedEvent, config, state?) => {
    return use(move, component, simulatedEvent, config, state);
  };
};

const use = (move, component, simulatedEvent, config, state?) => {
  const outcome = config.focusManager().get(component).bind((focused) => {
    return move(component.element(), focused, config, state);
  });

  return outcome.map((newFocus) => {
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