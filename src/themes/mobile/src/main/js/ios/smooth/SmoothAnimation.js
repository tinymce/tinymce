define(
  'tinymce.themes.mobile.ios.smooth.SmoothAnimation',

  [
    'ephox.katamari.api.Option',
    'global!clearInterval',
    'global!Math',
    'global!setInterval'
  ],

  function (Option, clearInterval, Math, setInterval) {
    var adjust = function (value, destination, amount) {
      if (Math.abs(value - destination) <= amount) {
        return Option.none();
      } else if (value < destination) {
        return Option.some(value + amount);
      } else {
        return Option.some(value - amount);
      }
    };

    var create = function () {
      var interval = null;

      var animate = function (getCurrent, destination, amount, increment, doFinish, rate) {
        var finished = false;

        var finish = function (v) {
          finished = true;
          doFinish(v);
        };

        clearInterval(interval);

        var abort = function (v) {
          clearInterval(interval);
          finish(v);
        };

        interval = setInterval(function () {
          var value = getCurrent();
          adjust(value, destination, amount).fold(function () {
            clearInterval(interval);
            finish(destination);
          }, function (s) {
            increment(s, abort);
            if (! finished) {
              var newValue = getCurrent();
              // Jump to the end if the increment is no longer working.
              if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
                clearInterval(interval);
                finish(destination);
              }
            }
          });
        }, rate);
      };

      return {
        animate: animate
      };
    };

    return {
      create: create,
      adjust: adjust
    };
  }
);
