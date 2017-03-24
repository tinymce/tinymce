/**
 * BlockUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.blocks.BlockUtils',
  [
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Selectors'
  ],
  function (Compare, Attr, PredicateFind, Selectors) {
    var findByGuid = function (rootElement, guid) {
      return Selectors.one('[data-mce-block-id="' + guid + '"]', rootElement);
    };

    var isContentBlock = function (element) {
      return Attr.has(element, 'data-mce-block-type');
    };

    var isRoot = function (rootElm) {
      return function (elm) {
        return Compare.eq(elm, rootElm);
      };
    };

    var findParentBlock = function (rootElement, element) {
      return PredicateFind.closest(element, isContentBlock, isRoot(rootElement));
    };

    return {
      findByGuid: findByGuid,
      isContentBlock: isContentBlock,
      findParentBlock: findParentBlock
    };
  }
);
