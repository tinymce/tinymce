/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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