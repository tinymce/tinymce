/**
 * Styles.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.actions.Styles',

  [
    'tinymce.core.util.Tools'
  ],

  function (Tools) {

    var getTDTHOverallStyle = function (dom, elm, name) {
      var cells = dom.select("td,th", elm), firstChildStyle;

      var checkChildren = function (firstChildStyle, elms) {
        for (var i = 0; i < elms.length; i++) {
          var currentStyle = dom.getStyle(elms[i], name);
          if (typeof firstChildStyle === "undefined") {
            firstChildStyle = currentStyle;
          }
          if (firstChildStyle != currentStyle) {
            return "";
          }
        }
        return firstChildStyle;
      };

      firstChildStyle = checkChildren(firstChildStyle, cells);
      return firstChildStyle;
    };

    var applyAlign = function (editor, elm, name) {
      if (name) {
        editor.formatter.apply('align' + name, {}, elm);
      }
    };

    var applyVAlign = function (editor, elm, name) {
      if (name) {
        editor.formatter.apply('valign' + name, {}, elm);
      }
    };

    var unApplyAlign = function (editor, elm) {
      Tools.each('left center right'.split(' '), function (name) {
        editor.formatter.remove('align' + name, {}, elm);
      });
    };

    var unApplyVAlign = function (editor, elm) {
      Tools.each('top middle bottom'.split(' '), function (name) {
        editor.formatter.remove('valign' + name, {}, elm);
      });
    };

    return {
      applyAlign: applyAlign,
      applyVAlign: applyVAlign,
      unApplyAlign: unApplyAlign,
      unApplyVAlign: unApplyVAlign,
      getTDTHOverallStyle: getTDTHOverallStyle
    };
  }
);
