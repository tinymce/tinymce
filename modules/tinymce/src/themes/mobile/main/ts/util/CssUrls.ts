/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EditorManager from 'tinymce/core/api/EditorManager';
import Editor from 'tinymce/core/api/Editor';
import { Obj } from '@ephox/katamari';

export interface CssUrls {
  readonly content: string;
  readonly ui: string;
}

const derive = (editor: Editor): CssUrls => {
  const base = Obj.get(editor.settings, 'skin_url').fold(
    () => EditorManager.baseURL + '/skins/ui/oxide',
    (url) => url
  );

  return {
    content: base + '/content.mobile.min.css',
    ui: base + '/skin.mobile.min.css'
  };
};

export {
  derive
};
