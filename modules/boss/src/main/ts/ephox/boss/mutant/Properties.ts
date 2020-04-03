import TagBoundaries from '../common/TagBoundaries';
import { Arr, Option } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const children = function (item: Gene) {
  return item.children;
};

const name = function (item: Gene) {
  return item.name;
};

const parent = function (item: Gene): Option<Gene> {
  return item.parent;
};

const document = function (_item: Gene) {
  return undefined; // currently the test universe does not have documents
};

const isText = function (item: Gene) {
  return item.name === 'TEXT_GENE';
};

const isComment = function (item: Gene) {
  return item.name === 'COMMENT_GENE';
};

const isElement = function (item: Gene) {
  return item.name !== undefined && item.name !== 'TEXT_GENE' && item.name !== 'COMMENT_GENE';
};

const getText = function (item: Gene) {
  return Option.from(item.text).getOrDie('Text not available on this node');
};

const setText = function (item: Gene, value: string | undefined) {
  item.text = value;
};

const isEmptyTag = function (item: Gene) {
  return Arr.contains([ 'br', 'img', 'hr' ], item.name);
};

const isBoundary = function (item: Gene) {
  return Arr.contains(TagBoundaries, item.name);
};

const isNonEditable = function (item: Gene) {
  return isElement(item) && item.attrs.contenteditable === 'false';
};

export {
  children,
  name,
  parent,
  document,
  isText,
  isComment,
  isElement,
  getText,
  setText,
  isEmptyTag,
  isBoundary,
  isNonEditable
};
