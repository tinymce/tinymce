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
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.Parents',
    'tinymce.core.selection.SelectionUtils',
    'tinymce.core.selection.SimpleTableModel'
  ],
  function (Arr, Fun, Compare, Insert, Replication, Element, Fragment, Node, SelectorFilter, SelectorFind, ElementType, Parents, SelectionUtils, SimpleTableModel) {
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
      var parents = Parents.parentsAndSelf(Element.fromDom(rng.commonAncestorContainer), rootNode);
      var wrapElements = Arr.filter(parents, function (elm) {
        return ElementType.isInline(elm) || ElementType.isHeading(elm);
      });
      var fullWrappers = getFullySelectedListWrappers(parents, rng);
      return Arr.map(wrapElements.concat(fullWrappers), Replication.shallow);
    };

    var emptyFragment = function () {
      return Fragment.fromElements([]);
    };

    var getFragmentFromRange = function (rootNode, rng) {
      return wrap(Element.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng));
    };

    var getTableCellSelection = function (rootNode) {
      return SelectorFilter.descendants(rootNode, 'td[data-mce-selected],th[data-mce-selected]');
    };

    var getParentTable = function (rootElm, cell) {
      return SelectorFind.ancestor(cell, 'table', Fun.curry(Compare.eq, rootElm));
    };

    var getTableFragment = function (rootNode, selectedTableCells) {
      return getParentTable(rootNode, selectedTableCells[0]).bind(function (tableElm) {
        var firstCell = selectedTableCells[0];
        var lastCell = selectedTableCells[selectedTableCells.length - 1];
        var fullTableModel = SimpleTableModel.fromDom(tableElm);

        return SimpleTableModel.subsection(fullTableModel, firstCell, lastCell).map(function (sectionedTableModel) {
          return Fragment.fromElements([SimpleTableModel.toDom(sectionedTableModel)]);
        });
      }).getOrThunk(emptyFragment);
    };

    var getSelectionFragment = function (rootNode, rng) {
      return rng.collapsed ? emptyFragment() : getFragmentFromRange(rootNode, rng);
    };

    var read = function (rootNode, rng) {
      var selectedTableCells = getTableCellSelection(rootNode, rng);
      return selectedTableCells.length > 0 ? getTableFragment(rootNode, selectedTableCells) : getSelectionFragment(rootNode, rng);
    };

    return {
      read: read
    };
  }
);
