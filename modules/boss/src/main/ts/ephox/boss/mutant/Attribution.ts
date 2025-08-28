import { Gene } from '../api/Gene';

const set = (item: Gene, property: string, value: string | number | boolean): void => {
  item.attrs = {
    ...item.attrs,
    [property]: String(value)
  };
};

const get = (item: Gene, property: string): string => {
  return item.attrs[property];
};

const remove = (item: Gene, property: string): void => {
  const rest: Record<string, string> = { ...item.attrs };
  delete rest[property];
  item.attrs = rest;
};

const copyTo = (source: Gene, destination: Gene): void => {
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
