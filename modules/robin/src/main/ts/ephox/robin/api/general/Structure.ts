import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

const blockList = [
  'body',
  'p',
  'div',
  'article',
  'aside',
  'figcaption',
  'figure',
  'footer',
  'header',
  'nav',
  'section',
  'ol',
  'ul',
  // --- NOTE, TagBoundaries has li here. That means universe.isBoundary => true for li tags.
  'table',
  'thead',
  'tfoot',
  'tbody',
  'caption',
  'tr',
  'td',
  'th',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'address'
];

const isList = function <E, D> (universe: Universe<E, D>, item: E) {
  const tagName = universe.property().name(item);
  return Arr.contains([ 'ol', 'ul' ], tagName);
};

const isBlock = function <E, D> (universe: Universe<E, D>, item: E) {
  const tagName = universe.property().name(item);
  return Arr.contains(blockList, tagName);
};

const isFormatting = function <E, D> (universe: Universe<E, D>, item: E) {
  const tagName = universe.property().name(item);
  return Arr.contains([ 'address', 'pre', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], tagName);
};

const isHeading = function <E, D> (universe: Universe<E, D>, item: E) {
  const tagName = universe.property().name(item);
  return Arr.contains([ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], tagName);
};

const isContainer = function <E, D> (universe: Universe<E, D>, item: E) {
  return Arr.contains([ 'div', 'li', 'td', 'th', 'blockquote', 'body', 'caption' ], universe.property().name(item));
};

const isEmptyTag = function <E, D> (universe: Universe<E, D>, item: E) {
  return Arr.contains([ 'br', 'img', 'hr', 'input' ], universe.property().name(item));
};

const isFrame = function <E, D> (universe: Universe<E, D>, item: E) {
  return universe.property().name(item) === 'iframe';
};

const isInline = function <E, D> (universe: Universe<E, D>, item: E) {
  return !(isBlock(universe, item) || isEmptyTag(universe, item)) && universe.property().name(item) !== 'li';
};

export default {
  isBlock,
  isList,
  isFormatting,
  isHeading,
  isContainer,
  isEmptyTag,
  isFrame,
  isInline
};