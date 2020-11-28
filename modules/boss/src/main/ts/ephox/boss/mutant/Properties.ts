import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import TagBoundaries from '../common/TagBoundaries';

const children = function (item: Gene): Gene[] {
  return item.children;
};

const name = function (item: Gene): string {
  return item.name;
};

const parent = function (item: Gene): Optional<Gene> {
  return item.parent;
};

const document = function (_item: Gene): undefined {
  return undefined; // currently the test universe does not have documents
};

const isText = function (item: Gene): boolean {
  return item.name === 'TEXT_GENE';
};

const isComment = function (item: Gene): boolean {
  return item.name === 'COMMENT_GENE';
};

const isElement = function (item: Gene): boolean {
  return item.name !== undefined && item.name !== 'TEXT_GENE' && item.name !== 'COMMENT_GENE';
};

const getText = function (item: Gene): string {
  return Optional.from(item.text).getOrDie('Text not available on this node');
};

const setText = function (item: Gene, value: string | undefined): void {
  item.text = value;
};

const isEmptyTag = function (item: Gene): boolean {
  return Arr.contains([ 'br', 'img', 'hr' ], item.name);
};

const isBoundary = function (item: Gene): boolean {
  return Arr.contains(TagBoundaries, item.name);
};

const isNonEditable = function (item: Gene): boolean {
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
