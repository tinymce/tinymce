/**
 * ElementType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun } from '@ephox/katamari';
import { Node } from '@ephox/sugar';

const blocks = [
  'article', 'aside', 'details', 'div', 'dt', 'figcaption', 'footer',
  'form', 'fieldset', 'header', 'hgroup', 'html', 'main', 'nav',
  'section', 'summary', 'body', 'p', 'dl', 'multicol', 'dd', 'figure',
  'address', 'center', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'listing', 'xmp', 'pre', 'plaintext', 'menu', 'dir', 'ul', 'ol', 'li', 'hr',
  'table', 'tbody', 'thead', 'tfoot', 'th', 'tr', 'td', 'caption'
];

const voids = [
  'area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input',
  'isindex', 'link', 'meta', 'param', 'embed', 'source', 'wbr', 'track'
];

const tableCells = ['td', 'th'];
const tableSections = ['thead', 'tbody', 'tfoot'];

const textBlocks = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form',
  'blockquote', 'center', 'dir', 'fieldset', 'header', 'footer', 'article',
  'section', 'hgroup', 'aside', 'nav', 'figure'
];

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const listItems = ['li', 'dd', 'dt'];
const lists = ['ul', 'ol', 'dl'];
const wsElements = ['pre', 'script', 'textarea', 'style'];

const lazyLookup = function (items) {
  let lookup;
  return (node): boolean => {
    lookup = lookup ? lookup : Arr.mapToObject(items, Fun.constant(true));
    return lookup.hasOwnProperty(Node.name(node));
  };
};

const isHeading = lazyLookup(headings);
const isBlock = lazyLookup(blocks);
const isInline = (node) => Node.isElement(node) && !isBlock(node);
const isBr = (node) => Node.isElement(node) && Node.name(node) === 'br';
const isTextBlock = lazyLookup(textBlocks);
const isList = lazyLookup(lists);
const isListItem = lazyLookup(listItems);
const isVoid = lazyLookup(voids);
const isTableSection = lazyLookup(tableSections);
const isTableCell = lazyLookup(tableCells);
const isWsPreserveElement = lazyLookup(wsElements);

export {
  isBlock,
  isInline,
  isHeading,
  isTextBlock,
  isList,
  isListItem,
  isVoid,
  isTableSection,
  isTableCell,
  isBr,
  isWsPreserveElement
};