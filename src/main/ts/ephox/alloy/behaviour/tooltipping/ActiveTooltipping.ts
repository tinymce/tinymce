import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
// Not ideal coupling here.
import { Positioning } from '../../api/behaviour/Positioning';
import * as Attachment from '../../api/system/Attachment';
import { StreamingConfig } from '../../behaviour/streaming/StreamingTypes';
import { EventFormat, CustomEvent, ReceivingEvent, ReceivingInternalEvent } from '../../events/SimulatedEvent';
import * as NativeEvents from '../../api/events/NativeEvents';
import { TooltippingConfig, TooltippingState } from 'ephox/alloy/behaviour/tooltipping/TooltippingTypes';
import { Arr, Id } from '@ephox/katamari';

import * as Layout from '../../positioning/layout/Layout';

const ExclusivityChannel = Id.generate('tooltip.exclusive');

const ShowTooltipEvent = Id.generate('tooltip.show');
const HideTooltipEvent = Id.generate('tooltip.hide');

const events = (tooltipConfig: TooltippingConfig, state: TooltippingState): AlloyEvents.AlloyEventRecord => {
  var hide = () => {
    state.getTooltip().each((p) => {
      Attachment.detach(p);
      state.clearTooltip();
      state.clearTimer();
    });
  };

  // Logic.
  // For mouse, there is no delay for it showing, but after you move away,
  // you have a "delay" before it will actually disappear

  // For keyboard, there is a delay for it showing. As soon as focus is lost, it goes away.
  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.receive(), (comp, message) => {
      // TODO: Think about the types for this, or find a better way for this
      // to rely on receiving.
      const receivingData = <any>message as ReceivingInternalEvent;
      if (Arr.contains(receivingData.channels(), ExclusivityChannel)) hide();
    }),

    AlloyEvents.run(NativeEvents.focusin(), (comp) => {
      AlloyTriggers.emit(comp, ShowTooltipEvent);
    }),

    AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
      AlloyTriggers.emit(comp, HideTooltipEvent);
    }),

    AlloyEvents.run(ShowTooltipEvent, (comp) => {
      state.clearTimer();
      if (! state.isShowing()) {
        comp.getSystem().broadcastOn([ ExclusivityChannel ], { });
        var sink = tooltipConfig.lazySink()(comp).getOrDie();
        var popup = comp.getSystem().build({
          dom: tooltipConfig.tooltipDom(),
          events: AlloyEvents.derive([
            AlloyEvents.run(NativeEvents.mouseover(), (_) => {
              AlloyTriggers.emit(comp, ShowTooltipEvent);
            }),
            AlloyEvents.run(NativeEvents.mouseout(), (_) => {
              AlloyTriggers.emit(comp, HideTooltipEvent);
            })
          ])
        });

        state.setTooltip(popup);
        Attachment.attach(sink, popup);
        Positioning.position(sink, {
          anchor: 'hotspot',
          hotspot: comp,
          layouts: {
            onLtr: [ Layout.southmiddle, Layout.northmiddle, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ],
            onRtl : [ Layout.southmiddle, Layout.northmiddle, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]
          }
        }, popup);
      }
    }),

    AlloyEvents.run(HideTooltipEvent, (comp) => {
      state.resetTimer(() => {
        hide();
      }, tooltipConfig.delay());
    }),
    AlloyEvents.run(NativeEvents.mouseover(), (comp) => {
      AlloyTriggers.emit(comp, ShowTooltipEvent);
   }),
    AlloyEvents.run(NativeEvents.mouseout(), (comp) => {
      AlloyTriggers.emit(comp, HideTooltipEvent);
    })
  ]);

};

export {
  events
};