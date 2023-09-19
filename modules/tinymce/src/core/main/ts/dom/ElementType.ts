import { Arr, Fun, Obj } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import Schema from '../api/html/Schema';

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

const wrapBlockElements = [ 'pre' ].concat(headings);

const lazyLookup = <T extends Node = HTMLElement>(items: string[]) => {
  let lookup: Record<string, boolean> | undefined;
  return (node: SugarElement<Node>): node is SugarElement<T> => {
    lookup = lookup ? lookup : Arr.mapToObject(items, Fun.always);
    return Obj.has(lookup, SugarNode.name(node));
  };
};

const getBlockElements = (schema?: Schema) => schema ? Obj.mapToArray(schema.getBlockElements(), (_v, k) => k) : [];

const isHeading = lazyLookup<HTMLHeadingElement>(headings);
const isBlock = (schema?: Schema): any => schema ? lazyLookup(blocks.concat(getBlockElements(schema))) : lazyLookup(blocks);
const isTable = (node: SugarElement<Node>): node is SugarElement<HTMLTableElement> => SugarNode.name(node) === 'table';
const isInline = (node: SugarElement<Node>, schema?: Schema): node is SugarElement<HTMLElement> => SugarNode.isElement(node) && !isBlock(schema)(node);
const isBr = (node: SugarElement<Node>): node is SugarElement<HTMLBRElement> => SugarNode.isElement(node) && SugarNode.name(node) === 'br';
const isTextBlock = lazyLookup(textBlocks);
const isList = lazyLookup(lists);
const isListItem = lazyLookup(listItems);
const isVoid = lazyLookup(voids);
const isTableSection = lazyLookup(tableSections);
const isTableCell = lazyLookup<HTMLTableCellElement>(tableCells);
const isWsPreserveElement = lazyLookup(wsElements);
const isWrapBlockElement = lazyLookup(wrapBlockElements);
const isWrapElement = (node: SugarElement<Node>, schema?: Schema): boolean => isWrapBlockElement(node) || isInline(node, schema);

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
  isWsPreserveElement,
  isWrapElement
};
