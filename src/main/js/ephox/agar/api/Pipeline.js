define(
  'ephox.agar.api.Pipeline',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Type',
    'ephox.sand.api.JSON',
    'global!Error',
    'global!clearTimeout',
    'global!console',
    'global!setTimeout'
  ],

  function (Arr, Fun, Type, Json, Error, clearTimeout, console, setTimeout) {
    var SLOW = false;
    // This slows it down considerably.
    var DEBUG = false;

    var assertSteps = function (steps) {
      Arr.each(steps, function (s, i) {
        var msg;
        if (s === undefined) msg = 'step ' + i + ' was undefined. All steps: ' + Json.stringify(steps) + '\n';
        else if (Type.isArray(s)) msg = 'step ' + i + ' was an array';

        if (msg !== undefined) {
          console.trace(msg, steps);
          throw new Error(msg);
        }
      });
    };

    var pipeContinuity = function () {
      // When in DEBUG mode, the pipeline will throw warnings when next() has not been called after the TIMEOUT, it will also identify the step that has not called next.
      // This debug tool will work with pipes inside mixed pipes, there should only be 1 instance running at any given time, see the addPipeStep() instance
      var TIMEOUT = 8000;
      var completionStack = [];
      var completionHandle = null;

      var clear = function () {
        clearTimeout(completionHandle);
      };

      var onTimeout = function () {
        Arr.find(Arr.reverse(completionStack), function (step) {
          return step.completion === false;
        }).each(function (incomplete) {
          console.warn('[DEBUG-MODE] Test suite has not progressed after ' + TIMEOUT + 'ms.  This may be due to the current step function not calling next().  Ensure the step has next passed in and is called on completion in order to progress to the next test.');
          console.warn(incomplete.operation.toString());
        });
      };

      var timeExtension = function () {
        clear();
        completionHandle = setTimeout(onTimeout, TIMEOUT);
      };

      if (!DEBUG) {
        return function (_operation) {
          return Fun.noop;
        };
      } else {
        return function (operation) {
          var index = completionStack.length;
          completionStack.push({
            completion: false,
            operation: operation
          });
          return function () {
            // everytime next is called, we reset the timeout
            // allowing the next step a full TIMEOUT to complete.
            timeExtension();
            completionStack[index].completion = true;
          };
        };
      }
    };

    var addPipeStep = pipeContinuity();

    var debugPipeError = function (error, step) {
      if (!error.name) {
        console.error(error);
        console.error('[DEBUG-MODE] this step threw the error');
        console.warn(step.toString());
        return;
      }

      var isTypeError = error.name.toLowerCase() === "typeerror";
      var isApplyUndefinedError = error.message === "Cannot read property 'apply' of undefined";
      var stepIsFn = typeof step === 'function';
      var isCurriedStep = Fun.curry.toString().indexOf(step.toString()) > 0;

      if (stepIsFn === false) {
        console.error('[DEBUG-MODE] Each step in the Pipeline needs to be a function (..args, value, next, die), this step is of type: ' + typeof step );
      }

      if (isTypeError && isApplyUndefinedError && stepIsFn && isCurriedStep) {
        console.error('[DEBUG-MODE] It is possible that a function being curried is not defined, check Fun.curry');
      }
    };

    var callAsync = function (f) {
      typeof Promise !== "undefined" ? Promise.resolve().then(f) : setTimeout(f, 0);
    };

    var async = function (initial, steps, onSuccess, onFailure, delay) {
      assertSteps(steps);

      var chain = function (lastLink, index) {
        if (index < steps.length) {
          var asyncOperation = steps[index];
          // FIX: Make this test elsewhere without creating a circular dependency on Chain
          if (asyncOperation.runChain !== undefined) return onFailure('You cannot create a pipeline out of chains. Use Chain.asStep to turns chains into steps');
          var stepComplete = addPipeStep(asyncOperation);
          try {
            var nextStep = function (result) {
              chain(result, index + 1);
            };
            // Oh hai, did you forget to flatten the pipeline?
            asyncOperation(lastLink, function (x) {
              stepComplete();
              if (delay !== undefined) setTimeout(function () { nextStep(x); }, SLOW ? delay : 0);
              else callAsync(function () { nextStep(x); });
            }, onFailure);
          } catch (error) {
            if (DEBUG) debugPipeError(error, steps[index]);
            onFailure(error);
          }
        } else {
          onSuccess(lastLink);
        }
      };
      chain(initial, 0);
    };

    return {
      async: async
    };
  }
);