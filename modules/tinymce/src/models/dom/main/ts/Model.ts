/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import ModelManager, { Model } from 'tinymce/core/api/ModelManager';

const DomModel = (_editor: Editor): Model => {
  // TODO: Add table commands
  return {};
};

export default () => {
  ModelManager.add('dom', DomModel);
};
