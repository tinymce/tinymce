import type { AlloyComponent } from '@ephox/alloy';
import { Fun, Obj, Type } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type Editor from 'tinymce/core/api/Editor';
import type { EditorEventMap } from 'tinymce/core/api/EventTypes';
import type Observable from 'tinymce/core/api/util/Observable';

import OuterContainer from '../general/OuterContainer';

import * as DecoupledSidebar from './DecoupledSidebar';
import { getDecoupledSidebar } from './DecoupledSidebarSingleton';
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

// For when there is nowhere to render a sidebar: the controls stay registered, but do nothing.
const createNoopSidebarStrategy = (): SidebarStrategy => ({
  setSidebar: Fun.noop,
  toggleSidebar: Fun.noop,
  whichSidebar: Fun.constant(null)
});

// Same shape as the floating strategy: this editor owns one block inside the sidebar rendered into
// container, and setSidebar/toggleSidebar/whichSidebar only touch that block. Editors pointed at the
// same container share the one sidebar.
const createDecoupledSidebarStrategy = (editor: Editor, container: SugarElement<HTMLElement>): SidebarStrategy => {
  const decoupledSidebar = getDecoupledSidebar(container, editor);

  return {
    setSidebar: (panelConfigs, showSidebar) => {
      DecoupledSidebar.createSlots(decoupledSidebar, editor.id, panelConfigs);
      editor.on('remove', () => DecoupledSidebar.removeEditorSlots(decoupledSidebar, editor.id));

      // Show the default sidebar, unless another editor sharing this container already has one open.
      const configKey = showSidebar?.toLowerCase();
      if (Type.isString(configKey) && Obj.has(panelConfigs, configKey) && !DecoupledSidebar.isAnySidebarOpen(decoupledSidebar)) {
        DecoupledSidebar.toggleEditorSidebar(decoupledSidebar, editor.id, configKey);
      }
    },
    toggleSidebar: (name) => DecoupledSidebar.toggleEditorSidebar(decoupledSidebar, editor.id, name),
    whichSidebar: () => DecoupledSidebar.whichEditorSidebar(decoupledSidebar, editor.id).getOrNull()
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
  createDecoupledSidebarStrategy,
  createFloatingSidebarStrategy,
  createNoopSidebarStrategy,
  createStaticSidebarStrategy
};
