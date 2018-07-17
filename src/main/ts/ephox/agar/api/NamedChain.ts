import { Arr, Fun, Id, Merger, Result } from '@ephox/katamari';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Chain, Wrap } from './Chain';

const inputNameId = Id.generate('input-name');

const asChain = function <T>(chains: Chain<any, any>[]): Chain<T, any> {
  return Chain.fromChains([
    Chain.mapper(function (input: T) {
      return wrapSingle(inputNameId, input);
    })
  ].concat(chains));
};

// Write merges in its output into input because it knows that it was
// given a complete input.
const write = function <K extends string, T, U>(name: K, chain: Chain<T, U>) {
  return Chain.on(function (input: T, next: NextFn<Wrap<T & { [key in K]: U; }>>, die: DieFn) {
    chain.runChain(Chain.wrap(input), function (output: Wrap<U>) {
      const self = wrapSingle(name, Chain.unwrap(output));
      return next(
        Chain.wrap(
          Merger.deepMerge(input, self) as T & { [key in K]: U; }
        )
      );
    }, die);
  });
};

// Partial write does not try and merge in input, because it knows that it
// might not be getting the full input
const partialWrite = function <K extends string, T, U>(name: K, chain: Chain<T, U>) {
  return Chain.on(function (input: T, next: NextFn<Wrap<{ [key in K]: U; }>>, die: DieFn) {
    chain.runChain(Chain.wrap(input), function (output: Wrap<U>) {
      const self = wrapSingle(name, Chain.unwrap(output));
      return next(Chain.wrap(self));
    }, die);
  });
};

const wrapSingle = function <K extends string, T>(name: K, value: T): { [key in K]: T } {
  return {
    [name]: value
  } as { [key in K]: T };
};

const combine = function <K extends string, T, U>(input: T, name: K, value: U): T & { [name in K]: U } {
  return Merger.deepMerge(input, wrapSingle(name, value));
};

const process = function <T, U>(name: keyof T, chain: Chain<T[keyof T], U>) {
  return Chain.on(function (input: T, next: NextFn<Wrap<T & U>>, die) {
    const part = Chain.wrap(input[name]);
    chain.runChain(part, function (other) {
      const merged: T & U = Merger.deepMerge(input, Chain.unwrap(other));
      next(Chain.wrap(merged));
    }, die);
  });
};

const direct = function <T, U>(inputName: keyof T, chain: Chain<T[keyof T], U>, outputName: string) {
  return process(inputName, partialWrite(outputName, chain));
};

const overwrite = function <T, U>(inputName: keyof T & string, chain: Chain<T[keyof T], U>) {
  return direct(inputName, chain, inputName);
};

const writeValue = function <K extends string, U, T = {}>(name: K, value: U) {
  return Chain.mapper(function (input: T) {
    const wv = combine(input, name, value);
    return wv;
  });
};

const read = function <T>(name: keyof T, chain: Chain<T[keyof T], any>) {
  return Chain.on(function (input: T, next: NextFn<Wrap<T>>, die: DieFn) {
    chain.runChain(Chain.wrap(input[name]), function () {
      return next(Chain.wrap(input));
    }, die);
  });
};

const merge = function <T>(names: (keyof T & string)[], combinedName: string) {
  return Chain.mapper(function (input: T) {
    const r: Record<string, T[keyof T]> = {};
    Arr.each(names, function (name) {
      r[name] = input[name];
    });
    return combine(input, combinedName, r);
  });
};

const bundle = function <T, U, E>(f: (input: T) => Result<U, E>) {
  return Chain.binder(f);
};

const output = function <T>(name: keyof T) {
  return bundle(function (input: T): Result<T[keyof T], string> {
    return input.hasOwnProperty(name) ? Result.value(input[name]) : Result.error(name + ' is not a field in the index object.');
  });
};

const outputInput = output<any>(inputNameId);

const pipeline = function (namedChains: Chain<any, any>[], onSuccess: NextFn<any>, onFailure: DieFn, delay_doNotUse?: number) {
  Chain.pipeline([asChain(namedChains)], onSuccess, onFailure, delay_doNotUse);
};

const inputName = () => inputNameId;

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