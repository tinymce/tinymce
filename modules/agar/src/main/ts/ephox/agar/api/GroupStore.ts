import { Merger } from '@ephox/katamari';

export const GroupStore = <T = any>() => {
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
