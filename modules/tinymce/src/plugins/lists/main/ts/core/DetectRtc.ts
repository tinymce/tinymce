/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

export const hasRtcPlugin = (editor: Editor) => {
  if (/(^|[ ,])rtc([, ]|$)/.test(editor.settings.plugins) && PluginManager.get('rtc')) {
    return true;
  } else {
    return false;
  }
};
