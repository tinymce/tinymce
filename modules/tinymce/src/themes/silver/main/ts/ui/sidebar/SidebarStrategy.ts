import type { AlloyComponent } from '@ephox/alloy';

import OuterContainer from '../general/OuterContainer';

import * as FloatingSidebar from './FloatingSidebar';
import type { SidebarConfig } from './Sidebar';

export interface SidebarStrategy {
  setSidebar: (panelConfigs: SidebarConfig, showSidebar: string | undefined) => void;
  toggleSidebar: (name: string) => void;
  whichSidebar: () => string | null;
}

const createFloatingSidebarStrategy = (floatingSidebar: AlloyComponent): SidebarStrategy => ({
  setSidebar: (panelConfigs, showSidebar) => FloatingSidebar.setSidebar(floatingSidebar, panelConfigs, showSidebar),
  toggleSidebar: (name) => FloatingSidebar.toggleSidebar(floatingSidebar, name),
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
