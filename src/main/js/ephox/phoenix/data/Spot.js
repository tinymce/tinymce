define(
  'ephox.phoenix.data.Spot',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var point = Struct.immutable('element', 'offset');
    var range = Struct.immutable('element', 'start', 'finish');
    var points = Struct.immutable('begin', 'end');
    var text = Struct.immutable('element', 'text');

    return {
      point: point,
      range: range,
      points: points,
      text: text
    };
  }
);
