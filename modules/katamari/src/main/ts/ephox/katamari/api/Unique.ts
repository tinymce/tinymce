import * as Arr from './Arr';
import * as Obj from './Obj';

export const stringArray = (a: string[]): string[] => {
  const all = {};
  Arr.each(a, (key) => {
    all[key] = {};
  });
  return Obj.keys(all);
};
