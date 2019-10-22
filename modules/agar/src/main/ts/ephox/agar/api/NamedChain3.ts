import { Chain } from './Chain';
import { Obj, Result, Arr } from '@ephox/katamari';

export type NamedChain<X> = Chain<Partial<X>, Partial<X>>;

const getKey = <X, K extends keyof X>(key: K): Chain<Partial<X>, X[K]> => Chain.binder((input) => Result.fromOption(Obj.get(input, key), 'No value for key "' + key + '"'));

const getKeys: {
  <X, K1 extends keyof X> (key1: K1): Chain<Partial<X>, [X[K1]]>;
  <X, K1 extends keyof X, K2 extends keyof X> (key1: K1, key2: K2): Chain<Partial<X>, [X[K1], X[K2]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X> (key1: K1, key2: K2, key3: K3): Chain<Partial<X>, [X[K1], X[K2], X[K3]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X, K4 extends keyof X> (key1: K1, key2: K2, key3: K3, key4: K4): Chain<Partial<X>, [X[K1], X[K2], X[K3], X[K4]]>;
  <X, K1 extends keyof X, K2 extends keyof X, K3 extends keyof X, K4 extends keyof X, K5 extends keyof X> (key1: K1, key2: K2, key3: K3, key4: K4, key5: K5): Chain<Partial<X>, [X[K1], X[K2], X[K3], X[K4], X[K5]]>;
} = <X> (...keys: (keyof X)[]) => (Chain.binder((value: Partial<X>): Result<any[], string> => {
  return Arr.foldl(keys, (acc, key) => {
    return acc.bind((values) => {
      return Result.fromOption(Obj.get(value, key), 'Missing value for key "' + key + '"').map((val) => values.concat([val]));
    });
  }, Result.value<any[], string>([]));
})) as any;

const getNone = <X>(): Chain<Partial<X>, void> => Chain.mapper(() => undefined);

const putKey = <X, K extends keyof X>(key: K): Chain<[Partial<X>, X[K]], Partial<X>> => Chain.mapper(([data, result]) => ({ ...data, [key]: result }));

const putIdentity = <X>(): Chain<[Partial<X>, any], Partial<X>> => Chain.mapper(([data, _result]) => data);

const directX = <X, I, O>(get: Chain<Partial<X>, I>, calc: Chain<I, O>, put: Chain<[Partial<X>, O], Partial<X>>): NamedChain<X> => {
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

const readX = <X, I>(get: Chain<Partial<X>, I>, calc: Chain<I, any>): NamedChain<X> =>
  directX(get, calc, putIdentity());

const writeX = <X, O>(calc: Chain<void, O>, put: Chain<[Partial<X>, O], Partial<X>>): NamedChain<X> =>
  directX(getNone(), calc, put);

const direct = <X, K1 extends keyof X, K2 extends keyof X>(inputName: K1, calc: Chain<X[K1], X[K2]>, outputName: K2): NamedChain<X> =>
  directX(getKey(inputName), calc, putKey(outputName));

const read = <X, K extends keyof X>(inputName: K, calc: Chain<X[K], any>): NamedChain<X> =>
  readX(getKey(inputName), calc);

const write = <X, K extends keyof X>(calc: Chain<void, X[K]>, outputName: K): NamedChain<X> =>
  writeX(calc, putKey(outputName));

const asIOChain = <X> () => <I extends keyof X, O extends keyof X> (inputKey: I, outputKey: O, chains: NamedChain<X>[]) => Chain.fromChains([
  Chain.mapper<X[I], Partial<X>>((input: X[I]) => ({ [inputKey]: input } as unknown as Partial<X>)),
  ...chains,
  getKey<X, O>(outputKey)
]) as Chain<X[I], X[O]>;

const asIChain = <X> () => <I extends keyof X> (inputKey: I, chains: NamedChain<X>[]) => Chain.fromChains([
  Chain.mapper<X[I], Partial<X>>((input: X[I]) => ({ [inputKey]: input } as unknown as Partial<X>)),
  ...chains,
  Chain.inject<void>(undefined)
]) as Chain<X[I], void>;

const asOChain = <X> () => <O extends keyof X> (outputKey: O, chains: NamedChain<X>[]) => Chain.fromChains([
  Chain.inject({} as unknown as Partial<X>),
  ...chains,
  getKey<X, O>(outputKey)
]) as Chain<any, X[O]>;

export const NamedChain3 = {
  getKey,
  getKeys,
  getNone,
  putKey,
  putIdentity,
  directX,
  readX,
  writeX,
  direct,
  read,
  write,
  asIOChain,
  asIChain,
  asOChain
};
