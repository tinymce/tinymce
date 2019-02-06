import { Event } from '@ephox/porkbun';
import { Events } from '@ephox/porkbun';
import Adjustments from '../resize/Adjustments';
import BarManager from '../resize/BarManager';
import BarPositions from '../resize/BarPositions';



export default function (wire, vdirection) {
  var hdirection = BarPositions.height;
  var manager = BarManager(wire, vdirection, hdirection);

  var events = Events.create({
    beforeResize: Event(['table']),
    afterResize: Event(['table']),
    startDrag: Event([])
  });

  manager.events.adjustHeight.bind(function (event) {
    events.trigger.beforeResize(event.table());
    var delta = hdirection.delta(event.delta());
    Adjustments.adjustHeight(event.table(), delta, event.row(), hdirection);
    events.trigger.afterResize(event.table());
  });

  manager.events.startAdjust.bind(function (event) {
    events.trigger.startDrag();
  });

  manager.events.adjustWidth.bind(function (event) {
    events.trigger.beforeResize(event.table());
    var delta = vdirection.delta(event.delta(), event.table());
    Adjustments.adjustWidth(event.table(), delta, event.column(), vdirection);
    events.trigger.afterResize(event.table());
  });

  return {
    on: manager.on,
    off: manager.off,
    hideBars: manager.hideBars,
    showBars: manager.showBars,
    destroy: manager.destroy,
    events: events.registry
  };
};