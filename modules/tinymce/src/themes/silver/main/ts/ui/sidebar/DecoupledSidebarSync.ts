import { Arr, type Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import { arePeers } from './DecoupledSidebarSingleton';

const isSidebarOpen = (editor: Editor): boolean =>
  editor.queryCommandValue('ToggleSidebar') !== '';

// Only the editors rendering into the same container share a sidebar, so editors pointed at another
// container are none of our business. queryCommandValue is '' for editors that are removed or have
// not rendered their UI yet, and arePeers is false for them too, so it is safe to ask every editor
// on the page.
const getPeerWithOpenSidebar = (self: Editor): Optional<Editor> =>
  Arr.find(self.editorManager.get(), (editor) =>
    editor !== self && arePeers(self, editor) && isSidebarOpen(editor)
  );

// Registered during bootstrap, and only for editors that found their decoupled container, so
// editors using another sidebar type never take part.
const setup = (editor: Editor): void => {
  editor.on('BeforeExecCommand', (e) => {
    if (e.command.toLowerCase() !== 'togglesidebar') {
      return;
    }
    const willOpenNewSidebar = !isSidebarOpen(editor) && !!e.value;

    if (willOpenNewSidebar) {
      getPeerWithOpenSidebar(editor).each((owner) => {
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
