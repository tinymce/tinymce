define(
  'ephox.sugar.api.properties.Alignment',

  [
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Direction',
    'ephox.sugar.api.node.Node'
  ],

  function (Css, Direction, Node) {
    var normal = function (value) {
      return function (element) {
        return value;
      };
    };

    var lookups = {
      start: Direction.onDirection('left', 'right'),
      end: Direction.onDirection('right', 'left'),
      justify: normal('justify'),
      center: normal('center'),
      'match-parent': normal('match-parent')
    };

    var getAlignment = function (element, property) {
      var raw = Css.get(element, property);
      return lookups[raw] !== undefined ? lookups[raw](element) : raw;
    };

    var hasAlignment = function (element, property, value) {
      return Node.isText(element) ? false : getAlignment(element, property) === value;
    };

    return {
      hasAlignment: hasAlignment
    };
  }
);