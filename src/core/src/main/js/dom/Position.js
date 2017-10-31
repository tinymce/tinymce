/**
 * Position.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Position',
  [
    'ephox.katamari.api.Arr',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Traverse'
  ],
  function (Arr, PlatformDetection, Element, Node, Css, Traverse) {
    var browser = PlatformDetection.detect().browser;

    var firstElement = function (nodes) {
      return Arr.find(nodes, Node.isElement);
    };

    // Firefox has a bug where caption height is not included correctly in offset calculations of tables
    // this tries to compensate for that by detecting if that offsets are incorrect and then remove the height
    var getTableCaptionDeltaY = function (elm) {
      if (browser.isFirefox() && Node.name(elm) === 'table') {
        return firstElement(Traverse.children(elm)).filter(function (elm) {
          return Node.name(elm) === 'caption';
        }).bind(function (caption) {
          return firstElement(Traverse.nextSiblings(caption)).map(function (body) {
            var bodyTop = body.dom().offsetTop;
            var captionTop = caption.dom().offsetTop;
            var captionHeight = caption.dom().offsetHeight;
            return bodyTop <= captionTop ? -captionHeight : 0;
          });
        }).getOr(0);
      } else {
        return 0;
      }
    };

    var getPos = function (body, elm, rootElm) {
      var x = 0, y = 0, offsetParent, doc = body.ownerDocument, pos;

      rootElm = rootElm ? rootElm : body;

      if (elm) {
        // Use getBoundingClientRect if it exists since it's faster than looping offset nodes
        // Fallback to offsetParent calculations if the body isn't static better since it stops at the body root
        if (rootElm === body && elm.getBoundingClientRect && Css.get(Element.fromDom(body), 'position') === 'static') {
          pos = elm.getBoundingClientRect();

          // Add scroll offsets from documentElement or body since IE with the wrong box model will use d.body and so do WebKit
          // Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
          x = pos.left + (doc.documentElement.scrollLeft || body.scrollLeft) - doc.documentElement.clientLeft;
          y = pos.top + (doc.documentElement.scrollTop || body.scrollTop) - doc.documentElement.clientTop;

          return { x: x, y: y };
        }

        offsetParent = elm;
        while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType) {
          x += offsetParent.offsetLeft || 0;
          y += offsetParent.offsetTop || 0;
          offsetParent = offsetParent.offsetParent;
        }

        offsetParent = elm.parentNode;
        while (offsetParent && offsetParent !== rootElm && offsetParent.nodeType) {
          x -= offsetParent.scrollLeft || 0;
          y -= offsetParent.scrollTop || 0;
          offsetParent = offsetParent.parentNode;
        }

        y += getTableCaptionDeltaY(Element.fromDom(elm));
      }

      return { x: x, y: y };
    };

    return {
      getPos: getPos
    };
  }
);