/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Singleton } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

const onSetupAttributeToggle = (editor: Editor, styleName: string, styleValue: string) => {
  return (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();

    const init = () => {
      const value = {
        value: styleValue
      };

      api.setActive(editor.formatter.match(styleName, value));
      const binding = editor.formatter.formatChanged(styleName, api.setActive);
      boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

const onSetupClassToggle = (editor: Editor, styleName: string, styleValue: string) => {
  return (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();

    const init = () => {
      const value = {
        value: styleValue
      };

      api.setActive(editor.formatter.match(styleName, value));
      const binding = editor.formatter.formatChanged(styleName, api.setActive);
      boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

export {
  onSetupAttributeToggle,
  onSetupClassToggle
};
