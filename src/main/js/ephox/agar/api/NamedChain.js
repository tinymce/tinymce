define(
  'ephox.agar.api.NamedChain',

  [
    'ephox.agar.api.Chain',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Result'
  ],

  function (Chain, Arr, Fun, Id, Merger, Result) {
    var inputName = Id.generate('input-name');

    var asChain = function (chains) {
      return Chain.fromChains([
        Chain.mapper(function (input) {
          return wrapSingle(inputName, input);
        })
      ].concat(chains));
    };

    // Write merges in its output into input because it knows that it was
    // given a complete input.
    var write = function (name, chain) {
      return Chain.on(function (input, next, die) {
        chain.runChain(Chain.wrap(input), function (output) {
          var self = wrapSingle(name, Chain.unwrap(output));
          return next(
            Chain.wrap(
              Merger.deepMerge(input, self)
            )
          );
        }, die);
      });
    };
    
    // Partial write does not try and merge in input, because it knows that it 
    // might not be getting the full input
    var partialWrite = function (name, chain) {
      return Chain.on(function (input, next, die) {
        chain.runChain(Chain.wrap(input), function (output) {
          var self = wrapSingle(name, Chain.unwrap(output));
          return next(Chain.wrap(self));
        }, die);
      });
    };

    var wrapSingle = function (name, value) {
      var r = {};
      r[name] = value;
      return r;
    };

    var combine = function (input, name, value) {
      return Merger.deepMerge(input, wrapSingle(name, value));
    };

    var read = function (name, chain) {
      return Chain.on(function (input, next, die) {
        var part = Chain.wrap(input[name]);
        chain.runChain(part, function (other) {
          var merged = Merger.deepMerge(input, Chain.unwrap(other));
          next(Chain.wrap(merged));
        }, die);
      });
    };

    var direct = function (inputName, chain, outputName) {
      return read(inputName, partialWrite(outputName, chain));
    };

    var overwrite = function (inputName, chain) {
      return direct(inputName, chain, inputName);
    };

    var writeValue = function (name, value) {
      return Chain.mapper(function (input) {
        var wv = combine(input, name, value);
        return wv;
      });
    };

    var merge = function (names, combinedName) {
      return Chain.mapper(function (input) {
        var r = {};
        Arr.each(names, function (name) {
          r[name] = input[name];
        });
        return combine(input, combinedName, r);
      });
    };

    var bundle = function (f) {
      return Chain.binder(f);
    };

    var output = function (name) {
      return bundle(function (input) {
        return input.hasOwnProperty(name) ? Result.value(input[name]) : Result.error(name + ' is not a field in the index object.');
      });
    };

    var outputInput = output(inputName);

    var pipeline = function (namedChains, onSuccess, onFailure, delay) {
      Chain.pipeline([asChain(namedChains)], onSuccess, onFailure, delay);
    };

    return {
      inputName: Fun.constant(inputName),
      asChain: asChain,
      write: write,
      direct: direct,
      writeValue: writeValue,
      overwrite: overwrite,
      merge: merge,
      bundle: bundle,
      output: output,
      outputInput: outputInput,

      pipeline: pipeline
    };
  }
);