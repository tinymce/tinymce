import { Chain } from './Chain';
import { Obj, Result, Arr } from '@ephox/katamari';

export type NamedChain<X> = Chain<Partial<X>, Partial<X>>;

export const getKey = <X, K extends keyof X>(key: K): Chain<Partial<X>, X[K]> => Chain.binder((input) => Result.fromOption(Obj.get(input, key), 'No value for key "' + key + '"'));

export const getKeys: {
  <X, K1 extends keyof X>(key1: K1): Chain<Partial<X>, [X[K1]]>;
  <X, K1 extends keyof X, K2 extends keyof X>(key1: K1, key2: K2): Chain<Partial<X>, [X[K1], X[K2]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X>(key1: K1, key2: K2, key3: K3): Chain<Partial<X>, [X[K1], X[K2], X[K3]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X, K4 extends keyof X>(key1: K1, key2: K2, key3: K3, key4: K4): Chain<Partial<X>, [X[K1], X[K2], X[K3], X[K4]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X, K4 extends keyof X, K5 extends keyof X>(key1: K1, key2: K2, key3: K3, key4: K4, key5: K5): Chain<Partial<X>, [X[K1], X[K2], X[K3], X[K4], X[K5]]>;
} = <X>(...keys: (keyof X)[]) => (Chain.binder((value: Partial<X>): Result<any[], string> => {
  return Arr.foldl(keys, (acc, key) => {
    return acc.bind((values) => {
      return Result.fromOption(Obj.get(value, key), 'Missing value for key "' + key + '"').map((val) => values.concat([val]));
    });
  }, Result.value<any[], string>([]));
})) as any;

export const getNone = <X>(): Chain<Partial<X>, void> => Chain.mapper(() => undefined);

export const putKey = <X, K extends keyof X>(key: K): Chain<[Partial<X>, X[K]], Partial<X>> => Chain.mapper(([data, result]) => ({ ...data, [key]: result }));

export const putIdentity = <X>(): Chain<[Partial<X>, any], Partial<X>> => Chain.mapper(([data, _result]) => data);

export const directX = <X, I, O>(get: Chain<Partial<X>, I>, calc: Chain<I, O>, put: Chain<[Partial<X>, O], Partial<X>>): NamedChain<X> => {
  return Chain.on((value, next, die, logs) => {
    Chain.pipeline([
      Chain.inject(value),
      get,
      calc,
      Chain.mapper((output: O) => [value, output]),
      put
    ], next, die, logs);
  });
};

export const readX = <X, I, O>(get: Chain<Partial<X>, I>, calc: Chain<I, O>): NamedChain<X> =>
  directX(get, calc, putIdentity());

export const writeX = <X, O>(calc: Chain<void, O>, put: Chain<[Partial<X>, O], Partial<X>>): NamedChain<X> =>
  directX(getNone(), calc, put);

export const direct = <X, K1 extends keyof X, K2 extends keyof X>(inputName: K1, calc: Chain<X[K1], X[K2]>, outputName: K2): NamedChain<X> =>
  directX(getKey(inputName), calc, putKey(outputName));

export const read = <X, K extends keyof X, O>(inputName: K, calc: Chain<X[K], O>): NamedChain<X> =>
  readX(getKey(inputName), calc);

export const write = <X, K extends keyof X>(calc: Chain<void, X[K]>, outputName: K): NamedChain<X> =>
  writeX(calc, putKey(outputName));

export const effect = <X, O>(calc: Chain<void, O>): NamedChain<X> =>
  directX(getNone(), calc, putIdentity());

export const op = <X, K extends keyof X>(inputName: K, calc: (value: X[K]) => void): NamedChain<X> =>
readX(getKey(inputName), Chain.op(calc));

export const map = <X, K1 extends keyof X, K2 extends keyof X>(inputName: K1, calc: (value: X[K1]) => X[K2], outputName: K2): NamedChain<X> =>
  direct(inputName, Chain.mapper(calc), outputName);

export const bind = <X, K1 extends keyof X, K2 extends keyof X, E>(inputName: K1, calc: (input: X[K1]) => Result<X[K2], E>, outputName: K2): NamedChain<X> =>
  direct(inputName, Chain.binder(calc), outputName);

export const inject = <X, K extends keyof X>(value: X[K], outputName: K): NamedChain<X> =>
  write(Chain.inject(value), outputName);

export const injectThunk = <X, K extends keyof X>(thunk: () => X[K], outputName: K): NamedChain<X> =>
  write(Chain.injectThunked(thunk), outputName);

export const inputKey = <X, K extends keyof X>(key: K) => Chain.mapper<X[K], Partial<X>>((value) => ({ [key]: value } as unknown as Partial<X>));

export const inputEmpty = <X>() => Chain.inject({} as Partial<X>);

export const outputKey = <X, K extends keyof X>(key: K): Chain<[any, Partial<X>], X[K]> => Chain.binder(([_input, output]) => Result.fromOption(Obj.get(output, key), 'No value for key "' + key + '"'));

export const outputInput = <I>(): Chain<[I, any], I> => Chain.mapper(([input, _output]) => input);

export const asChain = <X, I, O> (inputAdapter: Chain<I, Partial<X>>, chains: NamedChain<X>[], outputAdapter: Chain<[I, Partial<X>], O>): Chain<I, O> => Chain.on((value, next, die, logs) => {
  Chain.pipeline([
    inputAdapter,
    ...chains,
    Chain.mapper((data: Partial<X>) => [value, data]),
    outputAdapter
  ], next, die, logs);
});

export const asIOChain = <X>() => <I extends keyof X, O extends keyof X>(inKey: I, outKey: O, chains: NamedChain<X>[]) =>
  asChain<X, X[I], X[O]>(inputKey(inKey), chains, outputKey(outKey));

export const asInputChain = <X>() => <I extends keyof X>(inKey: I, chains: NamedChain<X>[]) =>
  asChain<X, X[I], X[I]>(inputKey(inKey), chains, outputInput());

export const asOutputChain = <X>() => <O extends keyof X>(outKey: O, chains: NamedChain<X>[]) =>
  asChain<X, any, X[O]>(inputEmpty(), chains, outputKey(outKey));

export const asEffectChain = <X>() => <T> (chains: NamedChain<X>[]) =>
  asChain<X, T, T>(inputEmpty(), chains, outputInput());

export const fragment = <X>(chains: NamedChain<X>[]): NamedChain<X> => Chain.fromChains(chains);