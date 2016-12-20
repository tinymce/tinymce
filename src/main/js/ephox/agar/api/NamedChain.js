define(
  'ephox.agar.api.NamedChain',

  [
    'ephox.agar.api.Chain',
    'ephox.katamari.api.Merger'
  ],

  function (Chain, Merger) {
    var asChain = function (chains) {
      return Chain.fromChainsWith({}, chains);  
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
      var r = {};
      r[name] = value;
      return Merger.deepMerge(input, r);
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

    var bundle = function (f) {
      return Chain.binder(f);
    };

    return {
      asChain: asChain,
      write: write,
      direct: direct,
      writeValue: writeValue,
      overwrite: overwrite,
      bundle: bundle
    };
  }
);