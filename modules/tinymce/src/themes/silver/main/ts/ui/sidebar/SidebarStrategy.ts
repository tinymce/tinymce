import type { AlloyComponent } from '@ephox/alloy';

import type Editor from 'tinymce/core/api/Editor';

import OuterContainer from '../general/OuterContainer';

import type { SidebarConfig } from './Sidebar';
import type { SidebarManager } from './SidebarManager';

export interface SidebarStrategy {
  setSidebar: (panelConfigs: SidebarConfig, showSidebar: string | undefined) => void;
  toggleSidebar: (name: string) => void;
  whichSidebar: () => string | null;
}

// The floating sidebar is now driven by the shared SidebarManager. setSidebar registers this
// editor's sidebars with the manager; toggleSidebar/whichSidebar operate on this editor's block
// within the shared sidebar, keyed by editor id.
const createFloatingSidebarStrategy = (manager: SidebarManager, editor: Editor): SidebarStrategy => ({
  setSidebar: (panelConfigs, showSidebar) => manager.initSidebars(editor, panelConfigs, showSidebar),
  toggleSidebar: (name) => manager.toggleSidebar(editor.id, name),
  whichSidebar: () => manager.whichSidebar(editor.id)
});

const createStaticSidebarStrategy = (outerContainer: AlloyComponent): SidebarStrategy => ({
  setSidebar: (panelConfigs, showSidebar) => OuterContainer.setSidebar(outerContainer, panelConfigs, showSidebar),
  toggleSidebar: (name) => OuterContainer.toggleSidebar(outerContainer, name),
  whichSidebar: () => OuterContainer.whichSidebar(outerContainer)
});

export {
  createFloatingSidebarStrategy,
  createStaticSidebarStrategy
};
