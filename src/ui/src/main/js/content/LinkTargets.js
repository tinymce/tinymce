/**
 * LinkTargets.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module is enables you to get anything that you can link to in a element.
 *
 * @private
 * @class tinymce.ui.LinkTargets
 */
define(
  'tinymce.ui.content.LinkTargets',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFilter',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Fun, Id, Element, SelectorFilter, DOMUtils, Tools) {
    var trim = Tools.trim;
    var hasContentEditableState = function (value) {
      return function (node) {
        if (node && node.nodeType === 1) {
          if (node.contentEditable === value) {
            return true;
          }

          if (node.getAttribute('data-mce-contenteditable') === value) {
            return true;
          }
        }

        return false;
      };
    };

    var isContentEditableTrue = hasContentEditableState('true');
    var isContentEditableFalse = hasContentEditableState('false');

    var create = function (type, title, url, level, attach) {
      return {
        type: type,
        title: title,
        url: url,
        level: level,
        attach: attach
      };
    };

    var isChildOfContentEditableTrue = function (node) {
      while ((node = node.parentNode)) {
        var value = node.contentEditable;
        if (value && value !== 'inherit') {
          return isContentEditableTrue(node);
        }
      }

      return false;
    };

    var select = function (selector, root) {
      return Arr.map(SelectorFilter.descendants(Element.fromDom(root), selector), function (element) {
        return element.dom();
      });
    };

    var getElementText = function (elm) {
      return elm.innerText || elm.textContent;
    };

    var getOrGenerateId = function (elm) {
      return elm.id ? elm.id : Id.generate('h');
    };

    var isAnchor = function (elm) {
      return elm && elm.nodeName === 'A' && (elm.id || elm.name);
    };

    var isValidAnchor = function (elm) {
      return isAnchor(elm) && isEditable(elm);
    };

    var isHeader = function (elm) {
      return elm && /^(H[1-6])$/.test(elm.nodeName);
    };

    var isEditable = function (elm) {
      return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
    };

    var isValidHeader = function (elm) {
      return isHeader(elm) && isEditable(elm);
    };

    var getLevel = function (elm) {
      return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
    };

    var headerTarget = function (elm) {
      var headerId = getOrGenerateId(elm);

      var attach = function () {
        elm.id = headerId;
      };

      return create('header', getElementText(elm), '#' + headerId, getLevel(elm), attach);
    };

    var anchorTarget = function (elm) {
      var anchorId = elm.id || elm.name;
      var anchorText = getElementText(elm);

      return create('anchor', anchorText ? anchorText : '#' + anchorId, '#' + anchorId, 0, Fun.noop);
    };

    var getHeaderTargets = function (elms) {
      return Arr.map(Arr.filter(elms, isValidHeader), headerTarget);
    };

    var getAnchorTargets = function (elms) {
      return Arr.map(Arr.filter(elms, isValidAnchor), anchorTarget);
    };

    var getTargetElements = function (elm) {
      var elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
      return elms;
    };

    var hasTitle = function (target) {
      return trim(target.title).length > 0;
    };

    var find = function (elm) {
      var elms = getTargetElements(elm);
      return Arr.filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
    };

    return {
      find: find
    };
  }
);
