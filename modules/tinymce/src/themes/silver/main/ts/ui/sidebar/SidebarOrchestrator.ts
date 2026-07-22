import type { AlloyComponent } from '@ephox/alloy';
import { Cell, Fun, Obj, Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import type { CssPosition, Position } from './dragging/DragTypes';
import { applyPositionStyles, INITIAL_POSITION } from './dragging/SidebarDragging';

/*
 * Singleton that makes every editor's floating sidebar behave as if it were a single, shared,
 * page-level panel:
 *   - all floating sidebars share ONE resting position (synced on drag end), and
 *   - at most one floating sidebar is visible at a time across all editors.
 *
 * This is module-level shared state, mirroring the `let editors` pattern in EditorManager.
 */

interface Registration {
  readonly editor: Editor;
  readonly component: AlloyComponent;
}

// The single resting position shared by every floating sidebar.
const sharedPosition = Cell<CssPosition | Position>(INITIAL_POSITION);

// All currently registered floating sidebars, keyed by editor id.
const registrations: Record<string, Registration> = {};

// The editor whose floating sidebar is currently open (if any).
const openEditorId = Cell<Optional<string>>(Optional.none());

const register = (editor: Editor, component: AlloyComponent): void => {
  registrations[editor.id] = { editor, component };
};

const unregister = (editorId: string): void => {
  delete registrations[editorId];
  openEditorId.get().each((id) => {
    if (id === editorId) {
      openEditorId.set(Optional.none());
    }
  });
};

// The shared position cell, handed to each sidebar's dragging behaviour so they all read/write it.
const getSharedPositionCell: () => Cell<CssPosition | Position> = Fun.constant(sharedPosition);

// Push the shared resting position onto every registered floating sidebar's element.
const broadcastPosition = (): void => {
  const position = sharedPosition.get();
  Obj.each(registrations, ({ component }) => applyPositionStyles(component, position));
};

// Apply the shared position to a single editor's sidebar (used right after it opens).
const applyPositionTo = (editorId: string): void => {
  Obj.get(registrations, editorId).each(({ component }) => applyPositionStyles(component, sharedPosition.get()));
};

// If another editor currently has an open floating sidebar, close it via its own ToggleSidebar command.
// Returns true if there is nothing to close or the close succeeded, and false if the close was
// requested but did not happen (e.g. a listener prevented the BeforeExecCommand event).
const closeOthers = (editorId: string): boolean =>
  openEditorId.get().fold(
    // No editor has an open floating sidebar - nothing to close.
    Fun.always,
    (otherId) => {
      if (otherId === editorId) {
        return true;
      }
      return Obj.get(registrations, otherId).fold(
        // The open editor is no longer registered - treat it as already closed.
        Fun.always,
        ({ editor }) => {
          const openName = editor.queryCommandValue('ToggleSidebar');
          if (!openName) {
            // The editor reports no open sidebar - nothing to close.
            return true;
          }
          // execCommand returns false if BeforeExecCommand was prevented, meaning the command
          // never ran and the other sidebar is still open.
          return editor.execCommand('ToggleSidebar', false, openName, { skip_focus: true });
        }
      );
    }
  );

const notifyOpened = (editorId: string): void => {
  openEditorId.set(Optional.some(editorId));
};

const notifyClosed = (editorId: string): void => {
  openEditorId.get().each((id) => {
    if (id === editorId) {
      openEditorId.set(Optional.none());
    }
  });
};

export {
  register,
  unregister,
  getSharedPositionCell,
  broadcastPosition,
  applyPositionTo,
  closeOthers,
  notifyOpened,
  notifyClosed
};
