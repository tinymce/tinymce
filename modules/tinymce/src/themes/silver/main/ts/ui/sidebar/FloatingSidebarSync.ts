import { Arr, type Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../../api/Options';

const isSidebarOpen = (editor: Editor): boolean =>
  editor.queryCommandValue('ToggleSidebar') !== '';

// queryCommandValue is '' for editors that are removed or have not rendered their UI yet, so it is
// safe to ask every editor on the page.
const getEditorWithOpenFloatingSidebar = (self: Editor): Optional<Editor> =>
  Arr.find(self.editorManager.get(), (editor) =>
    editor !== self && Options.isFloatingSidebar(editor) && isSidebarOpen(editor)
  );

// Registered during bootstrap, and only for editors using the floating sidebar, so static sidebars
// never take part.
const setup = (editor: Editor): void => {
  editor.on('BeforeExecCommand', (e) => {
    if (e.command.toLowerCase() !== 'togglesidebar') {
      return;
    }
    const willOpenNewSidebar = !isSidebarOpen(editor) && !!e.value;

    if (willOpenNewSidebar) {
      getEditorWithOpenFloatingSidebar(editor).each((owner) => {
        const openSidebarName = owner.queryCommandValue('ToggleSidebar');
        // Closing goes through that editor's own command, so its BeforeExecCommand runs and it is
        // free to refuse. skip_focus, so closing it does not pull focus away.
        const sidebarCloseSuccess = owner.execCommand('ToggleSidebar', false, openSidebarName, { skip_focus: true });

        if (!sidebarCloseSuccess) {
          e.preventDefault();
        }
      });
    }
  });
};

export {
  setup
};
