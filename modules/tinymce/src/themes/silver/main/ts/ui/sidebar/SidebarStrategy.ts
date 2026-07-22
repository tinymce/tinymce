import type { AlloyComponent } from '@ephox/alloy';

import type Editor from 'tinymce/core/api/Editor';

import OuterContainer from '../general/OuterContainer';

import * as FloatingSidebar from './FloatingSidebar';
import type { SidebarConfig } from './Sidebar';
import * as SidebarOrchestrator from './SidebarOrchestrator';

export interface SidebarStrategy {
  setSidebar: (panelConfigs: SidebarConfig, showSidebar: string | undefined) => void;
  toggleSidebar: (name: string) => void;
  whichSidebar: () => string | null;
}

const createFloatingSidebarStrategy = (editor: Editor, floatingSidebar: AlloyComponent): SidebarStrategy => ({
  setSidebar: (panelConfigs, showSidebar) => FloatingSidebar.setSidebar(floatingSidebar, panelConfigs, showSidebar),
  toggleSidebar: (name) => {
    // Determine whether this toggle will OPEN the panel (a different/no panel is currently showing).
    const willOpen = !FloatingSidebar.whichSidebar(floatingSidebar).exists((current) => current === name);

    // Enforce single-visible: opening here first closes any other editor's open floating sidebar.
    // If that close was prevented, bail out so we never end up with two floating sidebars visible.
    if (willOpen && !SidebarOrchestrator.closeOthers(editor.id)) {
      // eslint-disable-next-line no-console
      console.warn('Unable to open the floating sidebar because closing the currently open floating sidebar was prevented.');
      return;
    }

    FloatingSidebar.toggleSidebar(floatingSidebar, name);

    // Keep the orchestrator's "who is open" state in sync with the actual result.
    FloatingSidebar.whichSidebar(floatingSidebar).fold(
      () => SidebarOrchestrator.notifyClosed(editor.id),
      () => {
        SidebarOrchestrator.notifyOpened(editor.id);
        // Make this sidebar appear at the shared resting position.
        SidebarOrchestrator.applyPositionTo(editor.id);
      }
    );
  },
  whichSidebar: () => FloatingSidebar.whichSidebar(floatingSidebar).getOrNull()
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
