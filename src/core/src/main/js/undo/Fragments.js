/**
 * Fragments.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module reads and applies html fragments from/to dom nodes.
 *
 * @class tinymce.undo.Fragments
 * @private
 */
define(
  'tinymce.core.undo.Fragments',
  [
    'global!document',
    'tinymce.core.html.Entities',
    'tinymce.core.undo.Diff',
    'tinymce.core.util.Arr'
  ],
  function (document, Entities, Diff, Arr) {
    var getOuterHtml = function (elm) {
      if (elm.nodeType === 1) {
        return elm.outerHTML;
      } else if (elm.nodeType === 3) {
        return Entities.encodeRaw(elm.data, false);
      } else if (elm.nodeType === 8) {
        return '<!--' + elm.data + '-->';
      }

      return '';
    };

    var createFragment = function (html) {
      var frag, node, container;

      container = document.createElement("div");
      frag = document.createDocumentFragment();

      if (html) {
        container.innerHTML = html;
      }

      while ((node = container.firstChild)) {
        frag.appendChild(node);
      }

      return frag;
    };

    var insertAt = function (elm, html, index) {
      var fragment = createFragment(html);
      if (elm.hasChildNodes() && index < elm.childNodes.length) {
        var target = elm.childNodes[index];
        target.parentNode.insertBefore(fragment, target);
      } else {
        elm.appendChild(fragment);
      }
    };

    var removeAt = function (elm, index) {
      if (elm.hasChildNodes() && index < elm.childNodes.length) {
        var target = elm.childNodes[index];
        target.parentNode.removeChild(target);
      }
    };

    var applyDiff = function (diff, elm) {
      var index = 0;
      Arr.each(diff, function (action) {
        if (action[0] === Diff.KEEP) {
          index++;
        } else if (action[0] === Diff.INSERT) {
          insertAt(elm, action[1], index);
          index++;
        } else if (action[0] === Diff.DELETE) {
          removeAt(elm, index);
        }
      });
    };

    var read = function (elm) {
      return Arr.filter(Arr.map(elm.childNodes, getOuterHtml), function (item) {
        return item.length > 0;
      });
    };

    var write = function (fragments, elm) {
      var currentFragments = Arr.map(elm.childNodes, getOuterHtml);
      applyDiff(Diff.diff(currentFragments, fragments), elm);
      return elm;
    };

    return {
      read: read,
      write: write
    };
  }
);