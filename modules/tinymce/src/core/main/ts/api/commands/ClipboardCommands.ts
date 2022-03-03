import Editor from '../Editor';
import Env from '../Env';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    'Cut,Copy,Paste': (command) => {
      const doc = editor.getDoc();
      let failed;

      // Try executing the native command
      try {
        doc.execCommand(command);
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
