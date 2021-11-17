/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// import { Api } from 'tinymce/models/dom/table/api/Api';

import AddOnManager from './AddOnManager';

export interface Model {
  // TODO: Figure out best way to add type for table API exposed by model
  table: any;
}

type ModelManager = AddOnManager<Model>;
const ModelManager: ModelManager = AddOnManager.ModelManager;

export default ModelManager;
