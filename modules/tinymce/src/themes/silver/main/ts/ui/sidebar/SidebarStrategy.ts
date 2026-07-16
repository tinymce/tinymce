import type { AlloyComponent } from '@ephox/alloy';
import { Obj, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type { EditorEventMap } from 'tinymce/core/api/EventTypes';
import type Observable from 'tinymce/core/api/util/Observable';

import OuterContainer from '../general/OuterContainer';

import * as FloatingSidebar from './FloatingSidebar';
import { getFloatingSidebar } from './FloatingSidebarSingleton';
import type { SidebarConfig, SidebarSizeConstraints } from './Sidebar';

export interface SidebarStrategy {
  setSidebar: (panelConfigs: SidebarConfig, showSidebar: string | undefined) => void;
  toggleSidebar: (name: string) => void;
  whichSidebar: () => string | null;
}

// This editor's slice of the shared floating sidebar: setSidebar appends its block, and
// toggleSidebar/whichSidebar only ever touch that block. Keeping one sidebar open across all
// editors is handled by FloatingSidebarSync, not here.
const createFloatingSidebarStrategy = (editor: Editor): SidebarStrategy => {
  const floatingSidebar = getFloatingSidebar();

  return {
    setSidebar: (panelConfigs, showSidebar) => {
      FloatingSidebar.createSlots(floatingSidebar, editor.id, panelConfigs);
      editor.on('remove', () => FloatingSidebar.removeEditorSlots(floatingSidebar, editor.id));

      // Show the default sidebar, unless another editor got in first and already has one open.
      const configKey = showSidebar?.toLowerCase();
      if (Type.isString(configKey) && Obj.has(panelConfigs, configKey) && !FloatingSidebar.isAnySidebarOpen(floatingSidebar)) {
        FloatingSidebar.toggleEditorSidebar(floatingSidebar, editor.id, configKey);
      }
    },
    toggleSidebar: (name) => FloatingSidebar.toggleEditorSidebar(floatingSidebar, editor.id, name),
    whichSidebar: () => FloatingSidebar.whichEditorSidebar(floatingSidebar, editor.id).getOrNull()
  };
};

const createStaticSidebarStrategy = (
  outerContainer: AlloyComponent,
  sizeConstraints: SidebarSizeConstraints,
  eventDispatcher: Observable<EditorEventMap>
): SidebarStrategy => ({
  setSidebar: (panelConfigs, showSidebar) => OuterContainer.setSidebar(outerContainer, panelConfigs, showSidebar, sizeConstraints, eventDispatcher),
  toggleSidebar: (name) => OuterContainer.toggleSidebar(outerContainer, name),
  whichSidebar: () => OuterContainer.whichSidebar(outerContainer)
});

export {
  createFloatingSidebarStrategy,
  createStaticSidebarStrategy
};
