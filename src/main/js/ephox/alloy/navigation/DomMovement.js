define(
  'ephox.alloy.navigation.DomMovement',

  [
    'ephox.sugar.api.properties.Direction'
  ],

  function (Direction) {
    // Looks up direction (considering LTR and RTL), finds the focused element,
    // and tries to move. If it succeeds, triggers focus and kills the event.
    var useH = function (movement) {
      return function (component, simulatedEvent, info) {
        var move = movement(component.element());
        return use(move, component, simulatedEvent, info);
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
      return function (component, simulatedEvent, info) {
        return use(move, component, simulatedEvent, info);
      };
    };

    var use = function (move, component, simulatedEvent, info) {
      var outcome = info.focusManager().get(component).bind(function (focused) {
        return move(component.element(), focused, info);
      });

      return outcome.map(function (newFocus) {
        info.focusManager().set(component, newFocus);
        return true;
      });
    };

    return {
      east: east,
      west: west,
      north: useV,
      south: useV,
      move: useV
    };
  }
);