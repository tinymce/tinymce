import { type AlloyComponent, Attachment, GuiFactory } from '@ephox/alloy';
import { Obj, Optional } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import * as FloatingSidebar from './FloatingSidebar';
import type { SidebarConfig } from './Sidebar';

// The single sidebar open across the whole page: which editor owns it and which panel it is.
interface OpenSidebar {
  editorId: string;
  name: string;
}

/*
 * SidebarManager
 * --------------
 * Page-level coordinator for the shared floating sidebar. Owns the single floating sidebar
 * element, rendered into the shared sink it is given at construction. Growing incrementally;
 * the fuller design is preserved for reference in SidebarManagerOld.ts.
 */

export class SidebarManager {
  private readonly sidebarSink: AlloyComponent;

  // Guards setup() against running more than once.
  private isSetup: boolean = false;

  // The single shared floating sidebar, once setup() has built it.
  private floatingSidebar: Optional<AlloyComponent> = Optional.none();

  // The one sidebar open across the whole page, if any. Only one editor's sidebar is ever
  // visible, so a single record is enough.
  private open: Optional<OpenSidebar> = Optional.none();

  // Registered editors, keyed by id, so the manager can drive ToggleSidebar on any of them.
  private editors: Record<string, Editor> = {};

  public constructor(sidebarSink: AlloyComponent) {
    this.sidebarSink = sidebarSink;
  }

  // Renders the floating sidebar into the provided sink. Guarded so it only ever runs once,
  // no matter how many editors call it.
  public setup(): void {
    if (this.isSetup) {
      return;
    }
    this.isSetup = true;

    const floatingSidebar = GuiFactory.build(FloatingSidebar.renderFloatingSidebar());
    Attachment.attach(this.sidebarSink, floatingSidebar);
    this.floatingSidebar = Optional.some(floatingSidebar);
  }

  // Registers an editor with the manager: remembers it (keyed by id), materialises its slots
  // into the shared floating sidebar, and listens for focus so it can swap the visible sidebar
  // to the newly focused editor. showSidebar handling is deferred.
  public initSidebars(editor: Editor, panelConfigs: SidebarConfig, _showSidebar: string | undefined): void {
    this.editors[editor.id] = editor;
    this.floatingSidebar.each((fs) => FloatingSidebar.createSlots(fs, editor.id, panelConfigs));
    editor.on('focus', () => this.notifyEditorFocused(editor.id));
    // showSidebar: deferred.
  }

  // Toggles the named panel for the given editor within the shared floating sidebar. Only one
  // editor's sidebar is ever visible; opening one hides the others (see FloatingSidebar).
  public toggleSidebar(editorId: string, name: string): void {
    this.open.fold(
      () => {
        // Nothing is open: open the requested sidebar.
        this.open = Optional.some({ editorId, name });
        this.render();
      },
      (current) => {
        if (current.editorId === editorId) {
          // Same editor: toggle its own panel off if it is the open one, otherwise switch to it.
          const isClosing = current.name === name;
          this.open = isClosing ? Optional.none() : Optional.some({ editorId, name });
          this.render();
        } else {
          // A different editor is taking over. Close the current owner through its own
          // ToggleSidebar command so that editor stays aware (state + toolbar button in sync),
          // then open the requested sidebar. skip_focus so closing does not steal focus.
          Obj.get(this.editors, current.editorId).each((owner) =>
            owner.execCommand('ToggleSidebar', false, current.name, { skip_focus: true }));
          this.open = Optional.some({ editorId, name });
          this.render();
        }
      }
    );
  }

  // Returns the panel currently open for the given editor, or null if none. Since only one
  // sidebar is open page-wide, only the owning editor ever reports an open panel.
  public whichSidebar(editorId: string): string | null {
    return this.open.filter((s) => s.editorId === editorId).map((s) => s.name).getOrNull();
  }

  // When an editor gains focus, move the open sidebar to it if it has that same sidebar
  // registered. Driven through the ToggleSidebar command on each editor so their internal
  // state and toolbar buttons stay in sync.
  private notifyEditorFocused(focusedId: string): void {
    this.open.each((current) => {
      // Nothing to do if the focused editor already owns the open sidebar.
      if (current.editorId === focusedId) {
        return;
      }
      Obj.get(this.editors, focusedId).each((focused) => {
        // If the focused editor doesn't have this sidebar registered, leave things as they are.
        if (!Obj.has(focused.ui.registry.getAll().sidebars, current.name)) {
          return;
        }
        // Close on the previous editor first (while `open` still points at it), then open on the
        // focused one. skip_focus so closing the previous editor's sidebar doesn't steal focus.
        Obj.get(this.editors, current.editorId).each((previous) =>
          previous.execCommand('ToggleSidebar', false, current.name, { skip_focus: true }));
        focused.execCommand('ToggleSidebar', false, current.name, { skip_focus: true });
      });
    });
  }

  // Reflects `open` in the shared floating sidebar: show the open editor's panel, or hide
  // everything when nothing is open.
  private render(): void {
    this.floatingSidebar.each((fs) =>
      this.open.fold(
        () => FloatingSidebar.hideAll(fs),
        (s) => FloatingSidebar.show(fs, s.editorId, s.name)
      )
    );
  }
}
