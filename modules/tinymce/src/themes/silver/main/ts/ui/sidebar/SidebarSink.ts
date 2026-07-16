import { type AlloyComponent, Attachment, Gui, GuiFactory } from '@ephox/alloy';
import { Singleton } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';

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
        style: 'z-index: 1299; position: relative;',
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
