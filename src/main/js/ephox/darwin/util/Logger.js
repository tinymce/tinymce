define(
  'ephox.darwin.util.Logger',

  [
    'global!Array'
  ],

  function (Array) {
    var log = function (category, label) {
      if (category === 'FIREFOX.shiftUp') {
        console.log.apply(console, [ label ].concat(Array.prototype.slice.call(arguments, 2)));
      }
    };

    return {
      log: log
    };
  }
);