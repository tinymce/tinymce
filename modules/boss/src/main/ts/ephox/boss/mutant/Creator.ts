import { Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import { TextGene } from '../api/TextGene';

const isNu = function (item: Gene) {
  return item.id === 'nu_' + item.name || Option.from(item.text).exists((text) => item.id === '?_' + text);
};

const seed = function () {
  return {
    random: Math.random()
  };
};

const nu = function (name: string) {
  return {
    ...Gene('nu_' + name, name),
    ...seed()
  };
};

const clone = function (item: Gene): Gene {
  return {
    ...item,
    children: [],
    id: 'clone**<' + item.id + '>'
  };
};

const text = function (value: string): Gene {
  return {
    ...TextGene('?_' + value, value),
    ...seed()
  };
};

export {
  nu,
  clone,
  text,
  isNu
};
