import { Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const set = function (item: Gene, property: string, value: string) {
  item.css = {
    ...item.css,
    [property]: value
  };
};

const get = function (item: Gene, property: string) {
  return item.css !== undefined && item.css[property] !== undefined ? item.css[property] : '0';
};

const getRaw = function (item: Gene, property: string): Option<string> {
  return item.css !== undefined && item.css[property] !== undefined ? Option.some(item.css[property]) : Option.none();
};

const remove = function (item: Gene, property: string) {
  const rest: Record<string, string> = { ...item.css };
  delete rest[property];
  item.css = rest;
};

export default {
  get,
  getRaw,
  set,
  remove
};