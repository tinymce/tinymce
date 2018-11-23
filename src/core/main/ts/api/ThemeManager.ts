/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UrlObject, AddOnManager } from './AddOnManager';
import { Editor } from 'tinymce/core/api/Editor';

// TODO: Remove this when TypeScript 2.8 is out!
// Needed because of this: https://github.com/Microsoft/TypeScript/issues/9944
export interface ThemeManager extends AddOnManager {
  add: (id: string, addOn: (editor: Editor, url: string) => any, dependencies?: any) => (editor: Editor, url: string) => any;
  createUrl: (baseUrl: UrlObject, dep: string | UrlObject) => UrlObject;
}

export default AddOnManager.ThemeManager as ThemeManager;