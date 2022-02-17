/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AddOnManager from './AddOnManager';

/**
 * This API will be expanded with new requirements (breaking changes) in minor releases.
 *
 * It will be made public in a future major release.
 *
 * @private
 * @class tinymce.Model
 */
export interface Model {
  readonly table: {
    readonly getSelectedCells: () => HTMLTableCellElement[];
    readonly clearSelectedCells: (container: Node) => void;
  };
}

type ModelManager = AddOnManager<Model>;
const ModelManager: ModelManager = AddOnManager.ModelManager;

export default ModelManager;
