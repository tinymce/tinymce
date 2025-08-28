import { Merger } from '@ephox/katamari';

export interface GroupStore<T> {
  readonly record: (prop: string, elem: T) => void;
  readonly get: () => Record<string, T[]>;
}

export const GroupStore = <T = any>(): GroupStore<T> => {
  const data: Record<string, T[]> = {};

  const record = (prop: string, elem: T) => {
    let d = data[prop] !== undefined ? data[prop] : [];
    d = d.concat(elem);
    data[prop] = d;
  };

  const get = (): Record<string, T[]> => Merger.deepMerge({}, data);

  return {
    record,
    get
  };
};
