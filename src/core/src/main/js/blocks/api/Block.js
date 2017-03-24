/**
 * Block.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.api.Block',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'tinymce.core.blocks.BlockSelection',
    'tinymce.core.blocks.BlockUtils',
    'tinymce.core.EditorSelection'
  ],
  function (Fun, Option, Remove, Element, BlockSelection, BlockUtils, EditorSelection) {
    var getRootElement = function (editor) {
      return Option.from(editor.getBody()).map(Element.fromDom);
    };

    var dom = function (editor, uuid, spec) {
      return function () {
        return getRootElement(editor).bind(function (rootElement) {
          return BlockUtils.findByGuid(rootElement, uuid);
        }).map(function (element) {
          return element.dom();
        }).getOr(null);
      };
    };

    var select = function (editor, uuid, spec) {
      return function () {
        getRootElement(editor).bind(function (rootElement) {
          BlockSelection.select(rootElement, uuid).map(function (element) {
            EditorSelection.select(editor, element);
          });
        });
      };
    };

    var unselect = function (editor, uuid, spec) {
      return function (forward) {
        return getRootElement(editor).bind(function (rootElement) {
          return EditorSelection.getSelectedElement(editor).bind(function (selectedElement) {
            return BlockSelection.unselect(rootElement, selectedElement, forward).map(function (range) {
              EditorSelection.setRawRange(editor, range);
              return range;
            });
          });
        }).isSome();
      };
    };

    var remove = function (editor, uuid, spec) {
      return function () {
        return getRootElement(editor).bind(function (rootElement) {
          BlockUtils.findByGuid(rootElement, uuid).map(function (element) {
            spec.remove(nu(editor, uuid, spec));

            if (unselect(false)) {
              Remove.remove(element);
            } else {
              editor.setContent('');
            }
          });
        });
      };
    };

    var nu = function (editor, uuid, spec) {
      return {
        dom: dom(editor, uuid, spec),
        select: select(editor, uuid, spec),
        unselect: unselect(editor, uuid, spec),
        remove: remove(editor, uuid, spec)
      };
    };

    return {
      nu: nu
    };
  }
);
