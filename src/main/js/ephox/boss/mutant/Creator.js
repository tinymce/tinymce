import TextGene from '../api/TextGene';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var isNu = function (item) {
  return item.id === 'nu_' + item.name || item.id === '?_' + item.text;
};

var seed = function () {
  return {
    random: Math.random()
  };
};

var nu = function (name) {
  return Merger.merge(
    { id: 'nu_' + name, name: name, parent: Option.none() },
    seed()
  );
};

var clone = function (item) {
  return Merger.merge({}, item, {
    children: [],
    id: 'clone**<' + item.id + '>'
  });
};

var text = function (value) {
  return Merger.merge(
    TextGene('?_' + value, value),
    seed()
  );
};

export default <any> {
  nu: nu,
  clone: clone,
  text: text,
  isNu: isNu
};