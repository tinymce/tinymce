define(
  'ephox.alloy.events.EventSource',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Cell'
  ],

  function (Objects, Cell) {
    var derive = function (rawEvent, rawTarget) {
      var source = Objects.readOptFrom(rawEvent, 'target').map(function (getTarget) {
        return getTarget();
      }).getOr(rawTarget);

      return Cell(source);
    };

    return {
      derive: derive
    };
  }
);