import Chain from './Chain';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Result } from '@ephox/katamari';

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

var process = function (name, chain) {
  return Chain.on(function (input, next, die) {
    var part = Chain.wrap(input[name]);
    chain.runChain(part, function (other) {
      var merged = Merger.deepMerge(input, Chain.unwrap(other));
      next(Chain.wrap(merged));
    }, die);
  });
};

var direct = function (inputName, chain, outputName) {
  return process(inputName, partialWrite(outputName, chain));
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

var read = function (name, chain) {
  return Chain.on(function (input, next, die) {
    chain.runChain(Chain.wrap(input[name]), function () {
      return next(Chain.wrap(input));
    }, die);
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

export default <any> {
  inputName: Fun.constant(inputName),
  asChain: asChain,
  write: write,
  direct: direct,
  writeValue: writeValue,
  overwrite: overwrite,
  read: read,
  merge: merge,
  bundle: bundle,
  output: output,
  outputInput: outputInput,

  pipeline: pipeline
};