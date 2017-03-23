/**
 * InsertBlock.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.InsertBlock',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Elements',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.blocks.api.Block',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.Empty'
  ],
  function (Arr, Fun, Future, Id, Option, Compare, Element, Elements, Fragment, Attr, Traverse, Block, CaretPosition, CaretWalker, Empty) {
    var isJustBeforeRoot = function (rootElement) {
      return function (element) {
        return Traverse.parent(element).map(function (parent) {
          return parent.dom() === rootElement.dom();
        }).getOr(false);
      };
    };

    var last = function (xs) {
      return xs.length > 0 ? Option.some(xs[xs.length - 1]) : Option.none();
    };

    var findSplitBlock = function (rootElement, node) {
      return last(Traverse.parents(node, isJustBeforeRoot(rootElement)));
    };

    var getBeforeFragmentNodes = function (rootElement, range) {
      return findSplitBlock(rootElement, Element.fromDom(range.startContainer)).fold(
        Fun.constant([]),
        function (splitElement) {
          var before = range.cloneRange();
          before.collapse(true);
          before.setStartBefore(splitElement.dom());
          var fragment = before.cloneContents();
          return Empty.isEmpty(Element.fromDom(fragment)) ? [] : Elements.fromDom(fragment.childNodes);
        }
      );
    };

    var getAfterFragmentNodes = function (rootElement, range) {
      return findSplitBlock(rootElement, Element.fromDom(range.endContainer)).fold(
        Fun.constant([]),
        function (splitElement) {
          var after = range.cloneRange();
          after.collapse(false);
          after.setEndAfter(splitElement.dom());
          var fragment = after.cloneContents();
          return Empty.isEmpty(Element.fromDom(fragment)) ? [] : Elements.fromDom(fragment.childNodes);
        }
      );
    };

    var expandStart = function (rootElement, range) {
      return findSplitBlock(rootElement, Element.fromDom(range.startContainer))
        .fold(
          Fun.constant(range),
          function (splitElement) {
            var after = range.cloneRange();
            after.setStartBefore(splitElement.dom());
            return after;
          }
        );
    };

    var expandEnd = function (rootElement, range) {
      return findSplitBlock(rootElement, Element.fromDom(range.endContainer))
        .fold(
          Fun.constant(range),
          function (splitElement) {
            var after = range.cloneRange();
            after.setEndAfter(splitElement.dom());
            return after;
          }
        );
    };

    var expandRange = function (rootElement, range) {
      var expandedRange = range.cloneRange();
      var startRange = expandStart(rootElement, range);
      var endRange = expandEnd(rootElement, range);
      expandedRange.setStart(startRange.startContainer, startRange.startOffset);
      expandedRange.setEnd(endRange.endContainer, endRange.endOffset);
      return expandedRange;
    };

    var validateRange = function (rootElement, range) {
      return Option.from(range).filter(function (range) {
        return (
          Compare.contains(rootElement, Element.fromDom(range.startContainer)) &&
          Compare.contains(rootElement, Element.fromDom(range.endContainer))
        );
      });
    };

    var insertBlockAtCaret = function (rootElement, element, range) {
      return validateRange(rootElement, range).map(function (validRange) {
        var beforeNodes = getBeforeFragmentNodes(rootElement, validRange);
        var afterNodes = getAfterFragmentNodes(rootElement, validRange);

        var expandedRange = expandRange(rootElement, validRange);
        expandedRange.deleteContents();

        var fragment = Fragment.fromElements(
          Arr.flatten([
            beforeNodes,
            [ element ],
            afterNodes
          ])
        );

        expandedRange.insertNode(fragment.dom());

        return element;
      });
    };

    var createFromSpec = function (editor, spec) {
      return Future.nu(function (resolve) {
        var uuid = Id.generate('block');
        var api = Block(editor, uuid);
        var insert = spec.insert();

        insert(api, function (element) {
          var sugarElement = Element.fromDom(element);
          Attr.setAll(sugarElement, {
            contenteditable: 'false',
            'data-mce-block-id': uuid
          });
          resolve(sugarElement);
        });
      });
    };

    var getValidRange = function (editor) {
      return validateRange(Element.fromDom(editor.getBody()), editor.selection.getRng());
    };

    var insert = function (editor, spec) {
      createFromSpec(editor, spec).get(function (element) {
        getValidRange(editor).map(function (range) {
          var rootElement = Element.fromDom(editor.getBody());
          insertBlockAtCaret(rootElement, element, range)
            .map(function (element) {
              editor.selection.select(element.dom());
            });
        });
      });
    };

    var canInsert = function (editor) {
      return getValidRange(editor.selection.getRng()).isSome();
    };

    return {
      insert: insert,
      insertBlockAtCaret: insertBlockAtCaret,
      canInsert: canInsert
    };
  }
);
