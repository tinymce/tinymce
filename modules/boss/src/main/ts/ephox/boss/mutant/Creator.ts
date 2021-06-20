import { Optional } from '@ephox/katamari';

import { Gene } from '../api/Gene';
import { TextGene } from '../api/TextGene';

interface Seed {
  readonly random: number;
}

const isNu = (item: Gene): boolean => {
  return item.id === 'nu_' + item.name || Optional.from(item.text).exists((text) => item.id === '?_' + text);
};

const seed = (): Seed => {
  return {
    random: Math.random()
  };
};

const nu = (name: string): Gene & Seed => {
  return {
    ...Gene('nu_' + name, name),
    ...seed()
  };
};

const clone = (item: Gene): Gene => {
  return {
    ...item,
    children: [],
    id: 'clone**<' + item.id + '>'
  };
};

const text = (value: string): Gene => {
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
