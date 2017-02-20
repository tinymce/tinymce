define(
  'ephox.agar.api.Chain',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.pipe.AsyncActions',
    'ephox.agar.pipe.GeneralActions',
    'ephox.agar.pipe.Pipe',
    'ephox.katamari.api.Arr',
    'global!Error'
  ],

  function (Pipeline, Step, AsyncActions, GeneralActions, Pipe, Arr, Error) {
    // TODO: Add generic step validation later.
    var on = function (f) {
      var runChain = Pipe(function (input, next, die) {
        if (! isInput(input)) {
          console.error('Invalid chain input: ', input);
          die(new Error('Input Value is not a chain: ' + input + '\nfunction: ' + f.toString()));
        }
        else {
          f(input.chain, function (v) {
            if (! isInput(v)) {
              console.error('Invalid chain output: ', v);
              die(new Error('Output value is not a chain: ' + v));
            }
            else next(v);
          }, die);
        }

      });

      return {
        runChain: runChain
      };
    };

    var control = function (chain, guard) {
      return on(function (input, next, die) {
        guard(chain.runChain, wrap(input), function (v) {
          next(v);
        }, die);
      });
    };

    var mapper = function (fx) {
      return on(function (input, next, die) {
        next(wrap(fx(input)));
      });
    };

    var binder = function (fx) {
      return on(function (input, next, die) {
        fx(input).fold(function (err) {
          die(err);
        }, function (v) {
          next(wrap(v));
        });
      });
    };

    var op = function (fx) {
      return on(function (input, next, die) {
        fx(input);
        next(wrap(input));
      });
    };

    var inject = function (value) {
      return on(function (_input, next, die) {
        next(wrap(value));
      });
    };

    var extract = function (chain) {
      if (! chain.runChain) throw ('Step: ' + chain.toString() + ' is not a chain');
      else return chain.runChain;
    };

    var fromChains = function (chains) {
      var cs = Arr.map(chains, extract);
      
      return on(function (value, next, die) {
        Pipeline.async(wrap(value), cs, next, die);
      });      
    };

    var fromChainsWith = function (initial, chains) {
      return fromChains(
        [ inject(initial) ].concat(chains)
      );
    };

    var fromParent = function (parent, chains) {
      return on(function (cvalue, cnext, cdie) {
        Pipeline.async(wrap(cvalue), [ parent.runChain ], function (value) {
          var cs = Arr.map(chains, function (c) {
            return Pipe(function (_, next , die) {
              // Replace _ with value
              c.runChain(value, next, die);
            });
          });

          Pipeline.async(wrap(cvalue), cs, function () {
            // Ignore all the values and use the original
            cnext(value);
          }, cdie);
        }, cdie);
      });      
    };

    var asStep = function (initial, chains) {
      return Step.async(function (next, die) {
        var cs = Arr.map(chains, extract);
        
        Pipeline.async(wrap(initial), cs, function () {
          // Ignore all the values and use the original
          next();
        }, die);
      });      
    };
   
    // Convenience functions
    var debugging = op(GeneralActions.debug);

    var log = function (message) {
      return op(GeneralActions.log(message));
    };

    var wait = function (amount) {
      return on(function (input, next, die) {
        AsyncActions.delay(amount)(function () {
          next(wrap(input));
        }, die);
      });
    };

    var wrap = function (v) {
      return { chain: v };
    };

    var unwrap = function (c) {
      return c.chain;
    };

    var isInput = function (v) {
      return v.chain !== undefined;
    };

    return {
      on: on,
      op: op,
      control: control,
      mapper: mapper,
      binder: binder,

      inject: inject,
      fromChains: fromChains,
      fromChainsWith: fromChainsWith,
      fromParent: fromParent,
      asStep: asStep,
      wrap: wrap,
      unwrap: unwrap,
      wait: wait,
      debugging: debugging,
      log: log
    };
  }
);