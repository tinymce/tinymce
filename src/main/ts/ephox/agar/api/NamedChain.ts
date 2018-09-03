import { Arr, Fun, Id, Merger, Result } from '@ephox/katamari';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Chain, Wrap } from './Chain';

const inputNameId = Id.generate('input-name');
const outputNameId = Id.generate('output-name');
const outputUnset = Id.generate('output-unset');

export type NamedData = Record<string, any>;
export type NamedChain = Chain<NamedData, NamedData>;

const asChain = function <T>(chains: NamedChain[]): Chain<T, any> {
  return Chain.fromChains(Arr.flatten([
    [Chain.mapper(function (input: T) {
      return {
        [inputNameId]: input,
        [outputNameId]: outputUnset
      };
    })],
    chains,
    [Chain.mapper(function (data: NamedData) {
      const output = data[outputNameId];
      delete data[outputNameId];
      return output === outputUnset ? data : output;
    })]
  ]));
};

// Write merges in its output into input because it knows that it was
// given a complete input.
const write = function (name: string, chain: Chain<NamedData, any>) {
  return Chain.on(function (input: NamedData, next: NextFn<Wrap<NamedData>>, die: DieFn) {
    chain.runChain(Chain.wrap(input), function (output: Wrap<any>) {
      const self = wrapSingle(name, Chain.unwrap(output));
      return next(
        Chain.wrap(
          Merger.merge(input, self) as NamedData
        )
      );
    }, die);
  });
};

// Partial write does not try and merge in input, because it knows that it
// might not be getting the full input
const partialWrite = function (name: string, chain: Chain<any, any>) {
  return Chain.on(function (input: any, next: NextFn<Wrap<NamedData>>, die: DieFn) {
    chain.runChain(Chain.wrap(input), function (output: Wrap<any>) {
      const self = wrapSingle(name, Chain.unwrap(output));
      return next(Chain.wrap(self));
    }, die);
  });
};

const wrapSingle = function (name: string, value: any): NamedData {
  if (name === '_') {
    return {};
  }
  return {
    [name]: value
  };
};

const combine = function (input: NamedData, name: string, value: any): NamedData {
  return Merger.merge(input, wrapSingle(name, value));
};

const process = function (name: string, chain: Chain<any, any>) {
  return Chain.on(function (input: NamedData, next: NextFn<Wrap<NamedData>>, die) {
    if (Object.prototype.hasOwnProperty.call(input, name)) {
      const part = Chain.wrap(input[name]);
      chain.runChain(part, function (other) {
        const merged: NamedData = Merger.merge(input, Chain.unwrap(other));
        next(Chain.wrap(merged));
      }, die);
    } else {
      die(name + ' is not a field in the index object.');
    }
  });
};

const direct = function (inputName: string, chain: Chain<any, any>, outputName: string) {
  return process(inputName, partialWrite(outputName, chain));
};

const overwrite = function (inputName: string, chain: Chain<any, any>) {
  return direct(inputName, chain, inputName);
};

const writeValue = function (name: string, value: any) {
  return Chain.mapper(function (input: NamedData) {
    const wv = combine(input, name, value);
    return wv;
  });
};

const read = function (name: string, chain: Chain<any, any>) {
  return Chain.on(function (input: NamedData, next: NextFn<Wrap<NamedData>>, die: DieFn) {
    chain.runChain(Chain.wrap(input[name]), function () {
      return next(Chain.wrap(input));
    }, die);
  });
};

const merge = function (names: string[], combinedName: string) {
  return Chain.mapper(function (input: NamedData) {
    const r: NamedData = {};
    Arr.each(names, function (name) {
      r[name] = input[name];
    });
    return combine(input, combinedName, r);
  });
};

const bundle = function <T, E>(f: (input: NamedData) => Result<T, E>) {
  return write(outputNameId, Chain.binder(f));
};

const output = function (name: string) {
  return direct(name, Chain.identity, outputNameId);
};

const outputInput = output(inputNameId);

const pipeline = function (namedChains: NamedChain[], onSuccess: NextFn<any>, onFailure: DieFn, delay_doNotUse?: number) {
  Chain.pipeline([asChain(namedChains)], onSuccess, onFailure, delay_doNotUse);
};

const inputName = () => inputNameId;

// tests need these values but other users should not
export const _outputName = () => outputNameId;
export const _outputUnset = () => outputUnset;

export const NamedChain = {
  inputName,
  asChain,
  write,
  direct,
  writeValue,
  overwrite,
  read,
  merge,
  bundle,
  output,
  outputInput,

  pipeline
};