import { Gene } from '../api/Gene';

const set = function (item: Gene, property: string, value: string | number | boolean): void {
  item.attrs = {
    ...item.attrs,
    [property]: String(value)
  };
};

const get = function (item: Gene, property: string): string {
  return item.attrs[property];
};

const remove = function (item: Gene, property: string): void {
  const rest: Record<string, string> = { ...item.attrs };
  delete rest[property];
  item.attrs = rest;
};

const copyTo = function (source: Gene, destination: Gene): void {
  destination.attrs = {
    ...destination.attrs,
    ...source.attrs
  };
};

export {
  get,
  set,
  remove,
  copyTo
};
