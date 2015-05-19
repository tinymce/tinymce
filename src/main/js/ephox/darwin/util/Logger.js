define(
  'ephox.darwin.util.Logger',

  [
    'global!Array'
  ],

  function (Array) {
    var active = 'B1.down';

    var log = function (category, label) {
      if (category === active) {
        console.log.apply(console, [ label ].concat(Array.prototype.slice.call(arguments, 2)));
      }
    };

    return {
      log: log
    };
  }
);