import { Merger } from '@ephox/katamari';

export const GroupStore = function () {
  const data: Record<string, any[]> = {};

  const record = function (prop: string, elem: any) {
    let d = data[prop] !== undefined ? data[prop] : [];
    d = d.concat(elem);
    data[prop] = d;
  };

  const get = function (): Record<string, any[]> {
    return Merger.deepMerge({}, data);
  };

  return {
    record: record,
    get: get
  };
};