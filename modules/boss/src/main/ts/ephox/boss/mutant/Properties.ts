import { Arr, Optional } from '@ephox/katamari';
import { Gene } from '../api/Gene';
import TagBoundaries from '../common/TagBoundaries';

const children = (item: Gene): Gene[] => {
  return item.children;
};

const name = (item: Gene): string => {
  return item.name;
};

const parent = (item: Gene): Optional<Gene> => {
  return item.parent;
};

const document = (_item: Gene): undefined => {
  return undefined; // currently the test universe does not have documents
};

const isText = (item: Gene): boolean => {
  return item.name === 'TEXT_GENE';
};

const isComment = (item: Gene): boolean => {
  return item.name === 'COMMENT_GENE';
};

const isElement = (item: Gene): boolean => {
  return item.name !== undefined && item.name !== 'TEXT_GENE' && item.name !== 'COMMENT_GENE';
};

const isSpecial = (item: Gene): boolean => {
  return item.name === 'SPECIAL_GENE';
}

const getText = (item: Gene): string => {
  return Optional.from(item.text).getOrDie('Text not available on this node');
};

const setText = (item: Gene, value: string | undefined): void => {
  item.text = value;
};

const isEmptyTag = (item: Gene): boolean => {
  return Arr.contains([ 'br', 'img', 'hr' ], item.name);
};

const isBoundary = (item: Gene): boolean => {
  return Arr.contains(TagBoundaries, item.name);
};

const isNonEditable = (item: Gene): boolean => {
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
  isSpecial,
  getText,
  setText,
  isEmptyTag,
  isBoundary,
  isNonEditable
};
