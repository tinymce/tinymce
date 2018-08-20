import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
// Not ideal coupling here.
import { Positioning } from '../../api/behaviour/Positioning';
import * as Attachment from '../../api/system/Attachment';
import { StreamingConfig } from '../../behaviour/streaming/StreamingTypes';
import { EventFormat, CustomEvent, ReceivingEvent, ReceivingInternalEvent } from '../../events/SimulatedEvent';
import * as NativeEvents from '../../api/events/NativeEvents';
import { TooltippingConfig, TooltippingState } from './TooltippingTypes';
import * as TooltippingApis from './TooltippingApis';
import { Arr, Id, Fun } from '@ephox/katamari';

import * as Layout from '../../positioning/layout/Layout';

import { ExclusivityChannel, ShowTooltipEvent, HideTooltipEvent } from './TooltippingCommunication';

const events = (tooltipConfig: TooltippingConfig, state: TooltippingState): AlloyEvents.AlloyEventRecord => {
  const hide = () => {
    state.getTooltip().each((p) => {
      Attachment.detach(p);
      state.clearTooltip();
      state.clearTimer();
    });
  };

  const show = (comp) => {
    if (! state.isShowing()) {
      TooltippingApis.hideAllExclusive(comp, tooltipConfig, state);
      const sink = tooltipConfig.lazySink()(comp).getOrDie();
      const popup = comp.getSystem().build({
        dom: tooltipConfig.tooltipDom(),
        components: tooltipConfig.components(),
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
          onLtr: Fun.constant([ Layout.southmiddle, Layout.northmiddle, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]),
          onRtl : Fun.constant([ Layout.southmiddle, Layout.northmiddle, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ])
        }
      }, popup);
    }
  };

  return AlloyEvents.derive([
    AlloyEvents.run(SystemEvents.receive(), (comp, message) => {
      // TODO: Think about the types for this, or find a better way for this
      // to rely on receiving.
      const receivingData = <any> message as ReceivingInternalEvent;
      if (Arr.contains(receivingData.channels(), ExclusivityChannel)) { hide(); }
    }),

    AlloyEvents.run(NativeEvents.focusin(), (comp) => {
      AlloyTriggers.emit(comp, ShowTooltipEvent);
    }),

    AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
      AlloyTriggers.emit(comp, HideTooltipEvent);
    }),

    AlloyEvents.run(ShowTooltipEvent, (comp) => {
      state.resetTimer(() => {
        show(comp);
      }, tooltipConfig.delay());
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
    }),

    AlloyEvents.runOnDetached((comp) => {
      hide();
    })
  ]);

};

export {
  events
};