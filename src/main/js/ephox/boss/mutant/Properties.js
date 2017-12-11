import TagBoundaries from '../common/TagBoundaries';
import { Arr } from '@ephox/katamari';

var children = function (item) {
  return item.children;
};

var name = function (item) {
  return item.name;
};

var parent = function (item) {
  return item.parent;
};

var isText = function (item) {
  return item.name === 'TEXT_GENE';
};

var isComment = function (item) {
  return item.name === 'COMMENT_GENE';
};

var isElement = function (item) {
  return item.name !== undefined && item.name !== 'TEXT_GENE' && item.name !== 'COMMENT_GENE';
};

var getText = function (item) {
  return item.text;
};

var setText = function (item, value) {
  item.text = value;
};

var isEmptyTag = function (item) {
  return Arr.contains([ 'br', 'img', 'hr' ], item.name);
};

var isBoundary = function (item) {
  return Arr.contains(TagBoundaries, item.name);
};

export default <any> {
  children: children,
  name: name,
  parent: parent,
  isText: isText,
  isComment: isComment,
  isElement: isElement,
  getText: getText,
  setText: setText,
  isEmptyTag: isEmptyTag,
  isBoundary: isBoundary
};