import { type AlloyComponent, Attachment, Gui, GuiFactory } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import { Compare, type SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';

import * as DecoupledSidebar from './DecoupledSidebar';

interface DecoupledSidebarInstance {
  readonly container: SugarElement<HTMLElement>;
  readonly sidebar: AlloyComponent;
  // The editors currently rendering into this instance, which are the editors that have to
  // coordinate to keep only one sidebar open.
  editorIds: string[];
}

// Unlike the floating sidebar, the decoupled sidebar has no single shared sink: it renders into
// whichever element the host page pointed `decoupled_sidebar_container_selector` at. Different
// editors can name different containers, so instances are cached per container element rather than
// as one global singleton.
const instances: DecoupledSidebarInstance[] = [];

const build = (container: SugarElement<HTMLElement>): AlloyComponent => {
  const sidebar = GuiFactory.build(DecoupledSidebar.renderDecoupledSidebar());

  const mothership = Gui.takeover(sidebar);
  Attachment.attachSystem(container, mothership);

  return sidebar;
};

const register = (instance: DecoupledSidebarInstance, editor: Editor): void => {
  if (!Arr.contains(instance.editorIds, editor.id)) {
    instance.editorIds.push(editor.id);
    editor.on('remove', () => {
      instance.editorIds = Arr.filter(instance.editorIds, (id) => id !== editor.id);
    });
  }
};

// Returns the decoupled sidebar for the given container, creating it on first use and reusing it
// afterwards. Editors sharing a container share the one sidebar, each owning its own block within
// it (see DecoupledSidebar.createSlots). It is never torn down: it outlives the editors that use
// it, and per-editor cleanup goes through DecoupledSidebar.removeEditorSlots.
const getDecoupledSidebar = (container: SugarElement<HTMLElement>, editor: Editor): AlloyComponent => {
  const instance = Arr.find(instances, (i) => Compare.eq(i.container, container))
    .getOrThunk(() => {
      const newInstance: DecoupledSidebarInstance = { container, sidebar: build(container), editorIds: [] };
      instances.push(newInstance);
      return newInstance;
    });

  register(instance, editor);
  return instance.sidebar;
};

// Whether the two editors render into the same decoupled sidebar, and so have to coordinate.
// False for editors that are not using a decoupled sidebar, or that point at different containers.
const arePeers = (editor1: Editor, editor2: Editor): boolean =>
  Arr.exists(instances, (instance) =>
    Arr.contains(instance.editorIds, editor1.id) && Arr.contains(instance.editorIds, editor2.id)
  );

export {
  arePeers,
  getDecoupledSidebar
};
