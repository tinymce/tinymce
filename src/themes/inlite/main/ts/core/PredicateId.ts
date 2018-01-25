/**
 * PredicateId.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const create = function (id, predicate) {
  return {
    id,
    predicate
  };
};

// fromContextToolbars :: [ContextToolbar] -> [PredicateId]
const fromContextToolbars = function (toolbars) {
  return Tools.map(toolbars, function (toolbar) {
    return create(toolbar.id, toolbar.predicate);
  });
};

export default {
  create,
  fromContextToolbars
};