import Global from '../util/Global';

export default function (arr: Iterable<number>) {
  const f: typeof Uint8Array = Global.getOrDie('Uint8Array');
  return new f(arr);
};