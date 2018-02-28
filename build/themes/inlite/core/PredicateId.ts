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
import { ContextToolbar } from 'tinymce/themes/inlite/core/Render';

const create = function (id: string, predicate: Function) {
  return {
    id,
    predicate
  };
};

// fromContextToolbars :: [ContextToolbar] -> [PredicateId]
const fromContextToolbars = function (toolbars: ContextToolbar[]) {
  return Tools.map(toolbars, function (toolbar: ContextToolbar) {
    return create(toolbar.id, toolbar.predicate);
  });
};

export default {
  create,
  fromContextToolbars
};