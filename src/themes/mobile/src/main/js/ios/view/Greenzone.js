import { Fun } from '@ephox/katamari';
import IosScrolling from '../scroll/IosScrolling';
import DeviceZones from './DeviceZones';
import CursorRefresh from '../../touch/focus/CursorRefresh';

var scrollIntoView = function (cWin, socket, dropup, top, bottom) {
  var greenzone = DeviceZones.getGreenzone(socket, dropup);
  var refreshCursor = Fun.curry(CursorRefresh.refresh, cWin);

  if (top > greenzone || bottom > greenzone) {
    IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
  } else if (top < 0) {
    IosScrolling.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
  } else {
    // do nothing
  }
};

export default <any> {
  scrollIntoView: scrollIntoView
};