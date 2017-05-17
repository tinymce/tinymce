/**
 * ElementType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.ElementType',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Node'
  ],
  function (Arr, Fun, Node) {
    var blocks = [
      'article', 'aside', 'details', 'div', 'dt', 'figcaption', 'footer',
      'form', 'fieldset', 'header', 'hgroup', 'html', 'main', 'nav',
      'section', 'summary', 'body', 'p', 'dl', 'multicol', 'dd', 'figure',
      'address', 'center', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'listing', 'xmp', 'pre', 'plaintext', 'menu', 'dir', 'ul', 'ol', 'li', 'hr',
      'table', 'tbody', 'thead', 'tfoot', 'th', 'tr', 'td', 'caption'
    ];

    var voids = [
      'area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input',
      'isindex', 'link', 'meta', 'param', 'embed', 'source', 'wbr', 'track'
    ];

    var tableCells = ['td', 'th'];

    var textBlocks = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form',
      'blockquote', 'center', 'dir', 'fieldset', 'header', 'footer', 'article',
      'section', 'hgroup', 'aside', 'nav', 'figure'
    ];

    var headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    var lazyLookup = function (items) {
      var lookup;
      return function (node) {
        lookup = lookup ? lookup : Arr.mapToObject(items, Fun.constant(true));
        return lookup.hasOwnProperty(Node.name(node));
      };
    };

    var isHeading = lazyLookup(headings);

    var isBlock = lazyLookup(blocks);

    var isInline = function (node) {
      return Node.isElement(node) && !isBlock(node);
    };

    return {
      isBlock: isBlock,
      isInline: isInline,
      isHeading: isHeading,
      isTextBlock: lazyLookup(textBlocks),
      isVoid: lazyLookup(voids),
      isTableCell: lazyLookup(tableCells)
    };
  }
);
