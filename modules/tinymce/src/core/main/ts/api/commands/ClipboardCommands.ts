/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import type Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor) => {
  const execNativeCommand = (command: string, ui?: boolean, value?: any) => {
    if (ui === undefined) {
      ui = false;
    }

    if (value === undefined) {
      value = null;
    }

    return editor.getDoc().execCommand(command, ui, value);
  };

  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      const doc = editor.getDoc();
      let failed;

      // Try executing the native command
      try {
        execNativeCommand(command);
      } catch (ex) {
        // Command failed
        failed = true;
      }

      // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
      if (command === 'paste' && !doc.queryCommandEnabled(command)) {
        failed = true;
      }

      // Present alert message about clipboard access not being available
      if (failed || !doc.queryCommandSupported(command)) {
        let msg = editor.translate(
          `Your browser doesn't support direct access to the clipboard. ` +
          'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
        );

        if (Env.os.isMacOS() || Env.os.isiOS()) {
          msg = msg.replace(/Ctrl\+/g, '\u2318+');
        }

        editor.notificationManager.open({ text: msg, type: 'error' });
      }
    }
  });
};
