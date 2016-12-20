define(
  'ephox.agar.api.Guard',

  [
    'ephox.agar.alien.ErrorTypes',
    'ephox.agar.api.Logger',
    'global!Error',
    'global!clearTimeout',
    'global!setTimeout'
  ],

  function (ErrorTypes, Logger, Error, clearTimeout, setTimeout) {
    var nu = function (f) {
      return f;
    };

    var tryUntilNot = function (label, interval, amount) {
      return nu(function (f, value, next, die) {
        var repeat = function (n) {
          f(value, function (v) {
            if (n <= 0) die(new Error('Waited for ' + amount + 'ms for something to be unsuccessful. ' + label));
            else {
              setTimeout(function () {
                repeat(n - interval);
              }, interval);
            }
          }, function (err) {
            // Note, this one is fairly experimental. Because errors cause die as well, this is probably not always the best
            // option. What we do is check to see if it is an error prototype
            if (Error.prototype.isPrototypeOf(err)) die(err);
            else next(value);
          });
        };
        repeat(amount);
      });
    };

    var tryUntil = function (label, interval, amount) {
      return nu(function (f, value, next, die) {
        var repeat = function (n) {
          f(value, next, function (err) {
            if (n <= 0) die(ErrorTypes.enrichWith('Waited for ' + amount + 'ms for something to be successful. ' + label, err));
            else {
              setTimeout(function () {
                repeat(n - interval);
              }, interval);
            }
          });
        };
        repeat(amount);
      });
    };

    var timeout = function (label, limit) {
      return nu(function (f, value, next, die) {
        var passed = false;
        var failed = false;

        var hasNotExited = function () {
          return passed === false && failed === false;
        };

        var timer = setTimeout(function () {
          if (hasNotExited()) {
            failed = true;
            die('Hit the limit (' + limit + ') for: ' + label);
          }
        }, limit);

        f(value, function (v) {
          clearTimeout(timer);
          if (hasNotExited()) {
            passed = true;
            next(v);
          }
        }, function (err) {
          if (hasNotExited()) {
            failed = true;
            die(err);
          }
        });
      });
    };

    var addLogging = function (label) {
      return nu(function (f, value, next, die) {
        return Logger.t(label, f)(value, next, die);
      });
    };

    return {
      timeout: timeout,
      tryUntil: tryUntil,
      tryUntilNot: tryUntilNot,
      addLogging: addLogging
    };
  }
);