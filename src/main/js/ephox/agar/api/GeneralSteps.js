define(
  'ephox.agar.api.GeneralSteps',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'global!clearInterval',
    'global!console',
    'global!setInterval',
    'global!setTimeout'
  ],

  function (Pipeline, Step, clearInterval, console, setInterval, setTimeout) {
    // This module needs tests
    var sequence = function (steps, _delay) {
      return Step.stateful(function (value, next, die) {
        Pipeline.async(value, steps, next, die, _delay);
      });
    };

    var repeat = function (amount, step) {
      var steps = [];
      for (var i = 0; i < amount; i++) {
        steps.push(step);
      }
      return steps;
    };

    var sequenceRepeat = function (amount, step) {
      var steps = repeat(amount, step);
      return sequence(steps);
    };

    var repeatUntil = function (label, repeatStep, successStep, numAttempts) {
      return Step.stateful(function (value, next, die) {
        var again = function (num) {
          if (num <= 0) {
            die(label + '\nRan out of attempts');
          } else {
            repeatStep(value, function () {
              successStep(value, next, function () {
                again(num - 1);
              });
            }, die);
          }
        };

        again(numAttempts);
      });
    };

    var waitForPredicate = function (label, interval, amount, predicate) {
      return Step.async(function (next, die) {
        if (predicate()) {
          // Must use a setTimeout here otherwise FontSizeTest gets 'too much recursion' on Firefox
          setTimeout(function () { next(); });
          return;
        }
        var counter = 0;
        var timer = setInterval(function () {
          counter += interval;
          try {
            if (predicate()) {
              clearInterval(timer);
              next();
              return;
            }
          } catch (err) {
            clearInterval(timer);
            die(err);
            return;
          }

          if (counter > amount) {
            clearInterval(timer);
            die('Waited for ' + label + ' for ' + amount + '(' + counter + '/' + interval + ') ms. Predicate condition failed.');
          }

        }, interval);
      });
    };

    return {
      sequence: sequence,
      repeatUntil: repeatUntil,
      waitForPredicate: waitForPredicate,
      repeat: repeat,
      sequenceRepeat: sequenceRepeat
    };
  }
);