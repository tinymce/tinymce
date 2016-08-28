define(
  'ephox.katamari.async.Bounce',

  [
    'global!Array',
    'global!setTimeout'
  ],

  function (Array, setTimeout) {

    var bounce = function(f) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var me = this;
        setTimeout(function() {
          f.apply(me, args);
        }, 0);
      };
    };

    return {
      bounce: bounce
    };
  }
);
