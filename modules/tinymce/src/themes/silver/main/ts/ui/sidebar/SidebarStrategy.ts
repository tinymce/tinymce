import type { AlloyComponent } from '@ephox/alloy';

import type { EditorEventMap } from 'tinymce/core/api/EventTypes';
import type Observable from 'tinymce/core/api/util/Observable';

import OuterContainer from '../general/OuterContainer';

import * as FloatingSidebar from './FloatingSidebar';
import type { SidebarConfig, SidebarSizeConstraints } from './Sidebar';

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
