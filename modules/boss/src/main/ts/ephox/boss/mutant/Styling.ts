import { Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';

const set = (item: Gene, property: string, value: string): void => {
  item.css = {
    ...item.css,
    [property]: value
  };
};

const get = (item: Gene, property: string): string => {
  return item.css !== undefined && item.css[property] !== undefined ? item.css[property] : '0';
};

const getRaw = (item: Gene, property: string): Optional<string> => {
  return item.css !== undefined && item.css[property] !== undefined ? Optional.some(item.css[property]) : Optional.none();
};

const remove = (item: Gene, property: string): void => {
  const rest: Record<string, string> = { ...item.css };
  delete rest[property];
  item.css = rest;
};

export {
  get,
  getRaw,
  set,
  remove
};
