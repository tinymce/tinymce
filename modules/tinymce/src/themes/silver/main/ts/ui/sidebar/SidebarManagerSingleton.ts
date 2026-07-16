import type { AlloyComponent } from '@ephox/alloy';
import { Singleton } from '@ephox/katamari';

import { SidebarManager } from './SidebarManager';

/*
 * SidebarManagerSingleton
 * -----------------------
 * The floating sidebar is shared across every editor on the page, so its coordinator
 * (SidebarManager) must be a single page-level instance rather than one-per-editor.
 *
 * We keep that instance in a module-level `Singleton.value` — the same lazy-single-value
 * idiom used throughout the theme (e.g. the motherships in Render.ts). It is built on
 * first request and reused thereafter.
 */

const manager = Singleton.value<SidebarManager>();

// Returns the page-wide SidebarManager, creating it on first use with the given shared sink.
// The sink argument is only used on first creation; later calls return the existing instance.
const getSidebarManager = (sidebarSink: AlloyComponent): SidebarManager =>
  manager.get().getOrThunk(() => {
    const instance = new SidebarManager(sidebarSink);
    manager.set(instance);
    return instance;
  });

export {
  getSidebarManager
};
