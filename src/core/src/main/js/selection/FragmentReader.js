/**
 * FragmentReader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.FragmentReader',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.node.Node',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.Parents',
    'tinymce.core.selection.SelectionUtils'
  ],
  function (Arr, Fun, Insert, Replication, Element, Fragment, Node, ElementType, Parents, SelectionUtils) {
    var findParentListContainer = function (parents) {
      return Arr.find(parents, function (elm) {
        return Node.name(elm) === 'ul' || Node.name(elm) === 'ol';
      });
    };

    var getFullySelectedListWrappers = function (parents, rng) {
      return Arr.find(parents, function (elm) {
        return Node.name(elm) === 'li' && SelectionUtils.hasAllContentsSelected(elm, rng);
      }).fold(
        Fun.constant([]),
        function (li) {
          return findParentListContainer(parents).map(function (listCont) {
            return [
              Element.fromTag('li'),
              Element.fromTag(Node.name(listCont))
            ];
          }).getOr([]);
        }
      );
    };

    var wrap = function (innerElm, elms) {
      var wrapped = Arr.foldl(elms, function (acc, elm) {
        Insert.append(elm, acc);
        return elm;
      }, innerElm);
      return elms.length > 0 ? Fragment.fromElements([wrapped]) : wrapped;
    };

    var getWrapElements = function (rootNode, rng) {
      var parents = Parents.parentsAndSelf(Element.fromDom(rng.commonAncestorContainer), Element.fromDom(rootNode));
      var wrapElements = Arr.filter(parents, function (elm) {
        return ElementType.isInline(elm) || ElementType.isHeading(elm);
      });
      var fullWrappers = getFullySelectedListWrappers(parents, rng);
      return Arr.map(wrapElements.concat(fullWrappers), Replication.shallow);
    };

    var getFragmentFromRange = function (rootNode, rng) {
      return wrap(Element.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng));
    };

    var read = function (rootNode, rng) {
      return rng.collapsed ? Fragment.fromElements([]) : getFragmentFromRange(rootNode, rng);
    };

    return {
      read: read
    };
  }
);
