import { Direction } from '@ephox/sugar';

// Looks up direction (considering LTR and RTL), finds the focused element,
// and tries to move. If it succeeds, triggers focus and kills the event.
var useH = function (movement) {
  return function (component, simulatedEvent, config, state) {
    var move = movement(component.element());
    return use(move, component, simulatedEvent, config, state);
  };
};

var west = function (moveLeft, moveRight) {
  var movement = Direction.onDirection(moveLeft, moveRight);
  return useH(movement);
};

var east = function (moveLeft, moveRight) {
  var movement = Direction.onDirection(moveRight, moveLeft);
  return useH(movement);
};

var useV = function (move) {
  return function (component, simulatedEvent, config, state) {
    return use(move, component, simulatedEvent, config, state);
  };
};

var use = function (move, component, simulatedEvent, config, state) {
  var outcome = config.focusManager().get(component).bind(function (focused) {
    return move(component.element(), focused, config, state);
  });

  return outcome.map(function (newFocus) {
    config.focusManager().set(component, newFocus);
    return true;
  });
};

export default <any> {
  east: east,
  west: west,
  north: useV,
  south: useV,
  move: useV
};