/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AddOnManager from './AddOnManager';

export interface Plugin {
  getMetadata? (): { name: string, url: string };

  // Allow custom apis
  [key: string]: any;
}

export default AddOnManager.PluginManager as AddOnManager<Plugin>;
