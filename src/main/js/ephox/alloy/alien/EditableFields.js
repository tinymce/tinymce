define(
  'ephox.alloy.alien.EditableFields',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Node'
  ],

  function (Arr, Node) {
    var inside = function (target) {
      return Arr.contains([ 'input', 'textarea' ], Node.name(target));
    };

    return {
      inside: inside
    };
  }
);