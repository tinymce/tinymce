define(
  'ephox.darwin.util.Logger',

  [
    'global!Array'
  ],

  function (Array) {
    var log = function (category, label) {
      if (category === 'IE.keyup') {
        console.log.apply(console, [ label ].concat(Array.prototype.slice.call(arguments, 0)));
      }
    };

    return {
      log: log
    };
  }
);