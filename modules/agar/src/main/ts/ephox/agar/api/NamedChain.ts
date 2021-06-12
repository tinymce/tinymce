import { Arr, Fun, Id, Obj, Result } from '@ephox/katamari';

import { DieFn, NextFn } from '../pipe/Pipe';
import { Chain } from './Chain';
import { TestLogs } from './TestLogs';

const inputNameId = Id.generate('input-name');
const outputNameId = Id.generate('output-name');
const outputUnset = Id.generate('output-unset');

export type NamedData = Record<string, any>;
export type NamedChain = Chain<NamedData, NamedData>;

const asChain = <T>(chains: NamedChain[]): Chain<T, any> =>
  Chain.fromChains(Arr.flatten([
    [ Chain.mapper((input: T) => ({
      [inputNameId]: input,
      [outputNameId]: outputUnset
    })) ],
    chains,
    [ Chain.mapper((data: NamedData) => {
      const output = data[outputNameId];
      delete data[outputNameId];
      return output === outputUnset ? data : output;
    }) ]
  ]));

// Write merges in its output into input because it knows that it was
// given a complete input.
const write = (name: string, chain: Chain<NamedData, any>): Chain<NamedData, NamedData> =>
  Chain.on((input, next, die, initLogs) => {
    chain.runChain(input, (output, newLogs) => {
      const self = wrapSingle(name, output);
      return next(
        { ...input, ...self },
        newLogs
      );
    }, die, initLogs);
  });

// Partial write does not try and merge in input, because it knows that it
// might not be getting the full input
const partialWrite = <T>(name: string, chain: Chain<T, any>): Chain<T, NamedData> =>
  Chain.on((input, next, die, initLogs) => {
    chain.runChain(input, (output, newLogs) => {
      const self = wrapSingle(name, output);
      return next(self, newLogs);
    }, die, initLogs);
  });

const wrapSingle = (name: string, value: any): NamedData => {
  if (name === '_') {
    return {};
  }
  return {
    [name]: value
  };
};

const combine = (input: NamedData, name: string, value: any): NamedData => ({ ...input, ...wrapSingle(name, value) });

const process = (name: string, chain: Chain<any, any>): Chain<NamedData, NamedData> =>
  Chain.on((input, next, die, initLogs) => {
    if (Obj.has(input, name)) {
      const part = input[name];
      chain.runChain(part, (other, newLogs) => {
        const merged: NamedData = { ...input, ...other };
        next(merged, newLogs);
      }, die, initLogs);
    } else {
      die(name + ' is not a field in the index object.', initLogs);
    }
  });

const direct = (inputName: string, chain: Chain<any, any>, outputName: string): Chain<NamedData, NamedData> =>
  process(inputName, partialWrite(outputName, chain));

const overwrite = (inputName: string, chain: Chain<any, any>): Chain<NamedData, NamedData> =>
  direct(inputName, chain, inputName);

const writeValue = (name: string, value: any): Chain<NamedData, NamedData> =>
  Chain.mapper((input) => combine(input, name, value));

const read = (name: string, chain: Chain<any, any>): Chain<NamedData, NamedData> =>
  Chain.on((input, next, die, initLogs) => {
    chain.runChain(input[name], (_, newLogs) =>
      next(input, newLogs), die, initLogs
    );
  });

const merge = (names: string[], combinedName: string): Chain<NamedData, NamedData> =>
  Chain.mapper((input) => {
    const r: NamedData = {};
    Arr.each(names, (name) => {
      r[name] = input[name];
    });
    return combine(input, combinedName, r);
  });

const bundle = <T, E>(f: (input: NamedData) => Result<T, E>): Chain<NamedData, NamedData> =>
  write(outputNameId, Chain.binder(f));

const output = (name: string): Chain<NamedData, NamedData> =>
  direct(name, Chain.identity, outputNameId);

const outputInput = output(inputNameId);

const pipeline = (namedChains: NamedChain[], onSuccess: NextFn<any>, onFailure: DieFn, initLogs: TestLogs): void => {
  Chain.pipeline([ asChain(namedChains) ], onSuccess, onFailure, initLogs);
};

const inputName = Fun.constant(inputNameId);

// tests need these values but other users should not
export const _outputName = Fun.constant(outputNameId);
export const _outputUnset = Fun.constant(outputUnset);

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
