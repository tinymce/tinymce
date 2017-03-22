/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.core.Utils',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var isLink = function (elm) {
      return elm && elm.nodeName === 'A' && elm.href;
    };

    var hasLinks = function (elements) {
      return Tools.grep(elements, isLink).length > 0;
    };

    var trimCaretContainers = function (text) {
      return text.replace(/\uFEFF/g, '');
    };

    var isOnlyTextSelected = function (html) {
      // Partial html and not a fully selected anchor element
      if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
        return false;
      }

      return true;
    };

    var getAnchorText = function (selection, anchorElm) {
      var text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });
      return trimCaretContainers(text);
    };

    return {
      isLink: isLink,
      hasLinks: hasLinks,
      isOnlyTextSelected: isOnlyTextSelected,
      getAnchorText: getAnchorText
    };
  }
);