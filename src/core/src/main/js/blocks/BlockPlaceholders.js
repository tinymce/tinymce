/**
 * BlockPlaceholders.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockPlaceholders',
  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Elements',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.blocks.BlockDom',
    'tinymce.core.dom.Empty'
  ],
  function (Arr, Element, Elements, Attr, Selectors, BlockDom, Empty) {
    var PLACEHOLDER_ATTR = 'data-mce-block-placeholder';

    var isPlaceholder = function (element) {
      return Attr.has(element, PLACEHOLDER_ATTR);
    };

    var removePlaceholder = function (element) {
      Attr.remove(element, PLACEHOLDER_ATTR);
    };

    var setup = function (editor) {
      editor.on('init', function () {
        editor.serializer.addTempAttr(PLACEHOLDER_ATTR);
      });

      editor.on('nodeChange', function (e) {
        var elements = Elements.fromDom(e.parents);
        Arr.each(elements, function (element) {
          if (isPlaceholder(element) && Empty.isEmpty(element) === false) {
            removePlaceholder(element);
          }
        });

        var rootElement = Element.fromDom(editor.getBody());
        Arr.each(Selectors.all('*[data-mce-block-focus]', rootElement), function (element) {
          Attr.remove(element, 'data-mce-block-focus');
        });

        Arr.each(elements, function (element) {
          if (BlockDom.isContentBlock(element)) {
            Attr.set(element, 'data-mce-block-focus', '1');
          }
        });
      });
    };

    return {
      setup: setup
    };
  }
);
