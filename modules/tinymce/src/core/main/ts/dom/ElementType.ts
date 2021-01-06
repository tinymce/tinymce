/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

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

const tableCells = [ 'td', 'th' ];
const tableSections = [ 'thead', 'tbody', 'tfoot' ];

const textBlocks = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form',
  'blockquote', 'center', 'dir', 'fieldset', 'header', 'footer', 'article',
  'section', 'hgroup', 'aside', 'nav', 'figure'
];

const headings = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
const listItems = [ 'li', 'dd', 'dt' ];
const lists = [ 'ul', 'ol', 'dl' ];
const wsElements = [ 'pre', 'script', 'textarea', 'style' ];

const lazyLookup = <T extends Node = HTMLElement>(items: string[]) => {
  let lookup;
  return (node: SugarElement<Node>): node is SugarElement<T> => {
    lookup = lookup ? lookup : Arr.mapToObject(items, Fun.always);
    return lookup.hasOwnProperty(SugarNode.name(node));
  };
};

const isHeading = lazyLookup<HTMLHeadingElement>(headings);
const isBlock = lazyLookup(blocks);
const isTable = (node: SugarElement<Node>): node is SugarElement<HTMLTableElement> => SugarNode.name(node) === 'table';
const isInline = (node: SugarElement<Node>): node is SugarElement<HTMLElement> => SugarNode.isElement(node) && !isBlock(node);
const isBr = (node: SugarElement<Node>): node is SugarElement<HTMLBRElement> => SugarNode.isElement(node) && SugarNode.name(node) === 'br';
const isTextBlock = lazyLookup(textBlocks);
const isList = lazyLookup(lists);
const isListItem = lazyLookup(listItems);
const isVoid = lazyLookup(voids);
const isTableSection = lazyLookup(tableSections);
const isTableCell = lazyLookup<HTMLTableCellElement>(tableCells);
const isWsPreserveElement = lazyLookup(wsElements);

export {
  isBlock,
  isTable,
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
