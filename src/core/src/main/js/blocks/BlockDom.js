/**
 * BlockDom.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockDom',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.dom.Empty'
  ],
  function (Arr, Option, Compare, Attr, Html, PredicateFind, Selectors, Empty) {
    var findBlocks = function (rootElement) {
      return Selectors.all('*[data-mce-block-type]', rootElement);
    };

    var findByGuid = function (rootElement, guid) {
      return Selectors.one('*[data-mce-block-id="' + guid + '"]', rootElement);
    };

    var isContentBlock = function (element) {
      return Attr.has(element, 'data-mce-block-type');
    };

    var getUuid = function (element) {
      return Attr.get(element, 'data-mce-block-id');
    };

    var getBlockType = function (element) {
      return Attr.get(element, 'data-mce-block-type');
    };

    var isRoot = function (rootElm) {
      return function (elm) {
        return Compare.eq(elm, rootElm);
      };
    };

    var findParentBlock = function (rootElement, element) {
      return PredicateFind.closest(element, isContentBlock, isRoot(rootElement));
    };

    var paddContentEditables = function (element) {
      var contentEditableElms = Selectors.all('*[contenteditable="true"]', element);
      Arr.each(contentEditableElms, function (element) {
        if (Empty.isEmpty(element)) {
          Html.set(element, '<br data-mce-bogus="1">');
        }
      });
    };

    var removeInternalAttrs = function (element) {
      Attr.remove(element, 'data-mce-block-id');
      Attr.remove(element, 'data-mce-block-focus');
      Attr.remove(element, 'contenteditable');
      Arr.each(Selectors.all('*[contenteditable]', element), function (subElement) {
        Attr.remove(subElement, 'contenteditable');
      });
    };

    var getSpec = function (editor, element) {
      return Option.from(editor.blocks.get(getBlockType(element)));
    };

    return {
      findBlocks: findBlocks,
      findByGuid: findByGuid,
      getUuid: getUuid,
      isRoot: isRoot,
      isContentBlock: isContentBlock,
      getBlockType: getBlockType,
      findParentBlock: findParentBlock,
      paddContentEditables: paddContentEditables,
      removeInternalAttrs: removeInternalAttrs,
      getSpec: getSpec
    };
  }
);
