import { type AlloyComponent, Attachment, Gui, GuiFactory } from '@ephox/alloy';
import { Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';

/*
 * SidebarSink
 * -----------
 * A SINGLE, page-level sink (Alloy mothership) that hosts the floating sidebar for every
 * editor on the page. Previously each editor built its own sidebar sink; here we consolidate
 * to one shared sink, created lazily on first request and reused by every editor thereafter.
 *
 * Why shared, and why its own sink?
 *   - The floating sidebar must live in a sink that is NOT tied to any single editor's DOM
 *     (an editor's own sinks are destroyed when it is removed). This shared sink is attached
 *     directly to <body> and lives for the lifetime of the page.
 *   - It is its own Alloy mothership, keeping the floating sidebar isolated from the popup and
 *     dialog sinks (separate stacking context, no entanglement with popup positioning).
 *
 * Note: because the sink is a single global, it deliberately does NOT carry per-editor styling
 * such as RTL direction — that will be revisited when a manager coordinates ownership.
 */

interface SidebarSink {
  readonly sink: AlloyComponent;
  readonly mothership: Gui.GuiSystem;
}

const sidebarSink = Singleton.value<SidebarSink>();

const build = (): SidebarSink => {
  const platform = PlatformDetection.detect();
  const deviceClasses = platform.deviceType.isTouch() ? [ 'tox-platform-touch' ] : [];

  const sink = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'tox', 'tox-silver-sink', 'tox-silver-sidebar-sink', 'tox-tinymce-aux' ].concat(deviceClasses),
      attributes: {
        ...I18n.isRtl() ? { dir: 'rtl' } : {}
      }
    }
  });

  const mothership = Gui.takeover(sink);
  // Attach once, to <body>, so the shared sink outlives any individual editor.
  Attachment.attachSystem(SugarBody.body(), mothership);

  return { sink, mothership };
};

// Returns the shared floating-sidebar sink, creating it on first use and reusing it afterwards.
const getSidebarSink = (): AlloyComponent =>
  sidebarSink.get().getOrThunk(() => {
    const built = build();
    sidebarSink.set(built);
    return built;
  }).sink;

export {
  getSidebarSink
};
