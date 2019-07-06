import { Merger } from '@ephox/katamari';

export const GroupStore = function <T = any> () {
  const data: Record<string, T[]> = {};

  const record = function (prop: string, elem: T) {
    let d = data[prop] !== undefined ? data[prop] : [];
    d = d.concat(elem);
    data[prop] = d;
  };

  const get = function (): Record<string, T[]> {
    return Merger.deepMerge({}, data);
  };

  return {
    record,
    get
  };
};
