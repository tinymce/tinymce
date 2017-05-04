/**
 * DeleteUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind'
  ],
  function (Arr, Option, Compare, Element, Node, PredicateFind) {
    var toLookup = function (names) {
      var lookup = Arr.foldl(names, function (acc, name) {
        acc[name] = true;
        return acc;
      }, { });

      return function (elm) {
        return lookup[Node.name(elm)] === true;
      };
    };

    var isTextBlock = toLookup([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form', 'blockquote', 'center',
      'dir', 'fieldset', 'header', 'footer', 'article', 'section', 'hgroup', 'aside', 'nav', 'figure'
    ]);

    var isBeforeRoot = function (rootNode) {
      return function (elm) {
        return Compare.eq(rootNode, Element.fromDom(elm.dom().parentNode));
      };
    };

    var getParentTextBlock = function (rootNode, elm) {
      return Compare.contains(rootNode, elm) ? PredicateFind.closest(elm, isTextBlock, isBeforeRoot(rootNode)) : Option.none();
    };

    return {
      getParentTextBlock: getParentTextBlock
    };
  }
);
