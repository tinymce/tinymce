/**
 * SelectionUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.SelectionUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Fun, Option, Options, Compare, Element, Node, Traverse, NodeType) {
    var getStartNode = function (rng) {
      var sc = rng.startContainer, so = rng.startOffset;
      if (NodeType.isText(sc)) {
        return so === 0 ? Option.some(Element.fromDom(sc)) : Option.none();
      } else {
        return Option.from(sc.childNodes[so]).map(Element.fromDom);
      }
    };

    var getEndNode = function (rng) {
      var ec = rng.endContainer, eo = rng.endOffset;
      if (NodeType.isText(ec)) {
        return eo === ec.data.length ? Option.some(Element.fromDom(ec)) : Option.none();
      } else {
        return Option.from(ec.childNodes[eo - 1]).map(Element.fromDom);
      }
    };

    var getFirstChildren = function (node) {
      return Traverse.firstChild(node).fold(
        Fun.constant([node]),
        function (child) {
          return [node].concat(getFirstChildren(child));
        }
      );
    };

    var getLastChildren = function (node) {
      return Traverse.lastChild(node).fold(
        Fun.constant([node]),
        function (child) {
          if (Node.name(child) === 'br') {
            return Traverse.prevSibling(child).map(function (sibling) {
              return [node].concat(getLastChildren(sibling));
            }).getOr([]);
          } else {
            return [node].concat(getLastChildren(child));
          }
        }
      );
    };

    var hasAllContentsSelected = function (elm, rng) {
      return Options.liftN([getStartNode(rng), getEndNode(rng)], function (startNode, endNode) {
        var start = Arr.find(getFirstChildren(elm), Fun.curry(Compare.eq, startNode));
        var end = Arr.find(getLastChildren(elm), Fun.curry(Compare.eq, endNode));
        return start.isSome() && end.isSome();
      }).getOr(false);
    };

    return {
      hasAllContentsSelected: hasAllContentsSelected
    };
  }
);
