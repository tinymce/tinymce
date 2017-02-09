/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.visualchars.Plugin
 * @private
 */
define(
  'tinymce.plugins.visualchars.core.Nodes',

  [
    'tinymce.plugins.visualchars.core.Data',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Element'
  ],

  function (Data, Arr, Node, Element) {
    var isMatch = function (n) {
      return Node.isText(n) &&
        Node.value(n) !== undefined &&
        Data.regExp.test(Node.value(n));
    };

    // inlined sugars PredicateFilter.descendants for file size
    var filterDescendants = function (scope, predicate) {
      var result = [];
      var dom = scope.dom();
      var children = Arr.map(dom.childNodes, Element.fromDom);

      Arr.each(children, function (x) {
        if (predicate(x)) {
          result = result.concat([ x ]);
        }
        result = result.concat(filterDescendants(x, predicate));
      });
      return result;
    };

    var findParentElm = function (elm, rootElm) {
      while (elm.parentNode) {
        if (elm.parentNode === rootElm) {
          return elm;
        }
        elm = elm.parentNode;
      }
    };

    var wrapCharWithSpan = function (value) {
      return '<span data-mce-bogus="1" class="mce-' + Data.charMap[value] + '">' + value + '</span>';
    };

    var replaceWithSpans = function (string) {
      return Arr.map(string.split(''), function (c) {
        return Data.regExp.test(c) ? wrapCharWithSpan(c) : c;
      }).join('');
    };

    return {
      isMatch: isMatch,
      filterDescendants: filterDescendants,
      findParentElm: findParentElm,
      replaceWithSpans: replaceWithSpans
    };
  }
);