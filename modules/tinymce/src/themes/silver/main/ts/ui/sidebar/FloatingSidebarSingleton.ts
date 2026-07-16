import { type AlloyComponent, Attachment, GuiFactory } from '@ephox/alloy';
import { Singleton } from '@ephox/katamari';

import * as FloatingSidebar from './FloatingSidebar';
import { getSidebarSink } from './SidebarSink';

const floatingSidebar = Singleton.value<AlloyComponent>();

const getFloatingSidebar = (): AlloyComponent =>
  floatingSidebar.get().getOrThunk(() => {
    const sidebar = GuiFactory.build(FloatingSidebar.renderFloatingSidebar());
    Attachment.attach(getSidebarSink(), sidebar);
    floatingSidebar.set(sidebar);
    return sidebar;
  });

export {
  getFloatingSidebar
};
