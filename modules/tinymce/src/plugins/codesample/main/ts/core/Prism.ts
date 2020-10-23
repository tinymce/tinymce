/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Global } from '@ephox/katamari';
import Prism from '@ephox/wrap-prismjs';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';

const get = (editor: Editor) => Global.Prism && Settings.useGlobalPrismJS(editor) ? Global.Prism : Prism;

export {
  get
};
