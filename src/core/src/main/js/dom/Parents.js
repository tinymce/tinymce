/**
 * Parents.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Parents',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.Traverse'
  ],
  function (Fun, Compare, Traverse) {
    var dropLast = function (xs) {
      return xs.slice(0, -1);
    };

    var parentsUntil = function (startNode, rootElm, predicate) {
      if (Compare.contains(rootElm, startNode)) {
        return dropLast(Traverse.parents(startNode, function (elm) {
          return predicate(elm) || Compare.eq(elm, rootElm);
        }));
      } else {
        return [];
      }
    };

    var parents = function (startNode, rootElm) {
      return parentsUntil(startNode, rootElm, Fun.constant(false));
    };

    var parentsAndSelf = function (startNode, rootElm) {
      return [startNode].concat(parents(startNode, rootElm));
    };

    return {
      parentsUntil: parentsUntil,
      parents: parents,
      parentsAndSelf: parentsAndSelf
    };
  }
);
