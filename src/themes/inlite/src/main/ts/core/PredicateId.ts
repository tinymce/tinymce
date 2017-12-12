/**
 * PredicateId.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/util/Tools';

var create = function (id, predicate) {
  return {
    id: id,
    predicate: predicate
  };
};

// fromContextToolbars :: [ContextToolbar] -> [PredicateId]
var fromContextToolbars = function (toolbars) {
  return Tools.map(toolbars, function (toolbar) {
    return create(toolbar.id, toolbar.predicate);
  });
};

export default <any> {
  create: create,
  fromContextToolbars: fromContextToolbars
};