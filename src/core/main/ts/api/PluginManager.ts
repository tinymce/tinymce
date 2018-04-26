/**
 * PluginManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { UrlObject, AddOnManager } from './AddOnManager';
import { Editor } from 'tinymce/core/api/Editor';

// TODO: Remove this when TypeScript 2.8 is out!
// Needed because of this: https://github.com/Microsoft/TypeScript/issues/9944
export interface PluginManager extends AddOnManager {
  add: (id: string, addOn: (editor: Editor, url: string) => any, dependencies?: any) => (editor: Editor, url: string) => any;
  createUrl: (baseUrl: UrlObject, dep: string | UrlObject) => UrlObject;
}

export default AddOnManager.PluginManager as PluginManager;