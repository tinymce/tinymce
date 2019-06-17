import { Arr } from '@ephox/katamari';
import * as Behaviour from '../../api/behaviour/Behaviour';
// Not ideal coupling here.
import { Positioning } from '../../api/behaviour/Positioning';
import { Replacing } from '../../api/behaviour/Replacing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Attachment from '../../api/system/Attachment';
import { ReceivingInternalEvent } from '../../events/SimulatedEvent';
import * as TooltippingApis from './TooltippingApis';
import { ExclusivityChannel, HideTooltipEvent, ShowTooltipEvent } from './TooltippingCommunication';
import { TooltippingConfig, TooltippingState } from './TooltippingTypes';

const events = (tooltipConfig: TooltippingConfig, state: TooltippingState): AlloyEvents.AlloyEventRecord => {
  const hide = (comp: AlloyComponent) => {
    state.getTooltip().each((p) => {
      Attachment.detach(p);
      tooltipConfig.onHide(comp, p);
      state.clearTooltip();
    });
    state.clearTimer();
  };

  const show = (comp) => {
    if (!state.isShowing()) {
      TooltippingApis.hideAllExclusive(comp, tooltipConfig, state);
      const sink = tooltipConfig.lazySink(comp).getOrDie();
      const popup = comp.getSystem().build({
        dom: tooltipConfig.tooltipDom,
        components: tooltipConfig.tooltipComponents,
        events: AlloyEvents.derive(
          tooltipConfig.mode === 'normal'
            ? [
              AlloyEvents.run(NativeEvents.mouseover(), (_) => {
                AlloyTriggers.emit(comp, ShowTooltipEvent);
              }),
              AlloyEvents.run(NativeEvents.mouseout(), (_) => {
                AlloyTriggers.emit(comp, HideTooltipEvent);
              })
            ]
            : []
        ),

        behaviours: Behaviour.derive([
          Replacing.config({})
        ])
      });

      state.setTooltip(popup);
      Attachment.attach(sink, popup);
      tooltipConfig.onShow(comp, popup);
      Positioning.position(sink, tooltipConfig.anchor(comp), popup);
    }
  };

  return AlloyEvents.derive(Arr.flatten([
    [
      AlloyEvents.run(ShowTooltipEvent, (comp) => {
        state.resetTimer(() => {
          show(comp);
        }, tooltipConfig.delay);
      }),
      AlloyEvents.run(HideTooltipEvent, (comp) => {
        state.resetTimer(() => {
          hide(comp);
        }, tooltipConfig.delay);
      }),
      AlloyEvents.run(SystemEvents.receive(), (comp, message) => {
        // TODO: Think about the types for this, or find a better way for this
        // to rely on receiving.
        const receivingData = <any> message as ReceivingInternalEvent;
        if (Arr.contains(receivingData.channels(), ExclusivityChannel)) { hide(comp); }
      }),
      AlloyEvents.runOnDetached((comp) => {
        hide(comp);
      })
    ],
    (
      tooltipConfig.mode === 'normal'
        ? [
          AlloyEvents.run(NativeEvents.focusin(), (comp) => {
            AlloyTriggers.emit(comp, ShowTooltipEvent);
          }),
          AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
            AlloyTriggers.emit(comp, HideTooltipEvent);
          }),
          AlloyEvents.run(NativeEvents.mouseover(), (comp) => {
            AlloyTriggers.emit(comp, ShowTooltipEvent);
          }),
          AlloyEvents.run(NativeEvents.mouseout(), (comp) => {
            AlloyTriggers.emit(comp, HideTooltipEvent);
          }),
        ]
        : [
          AlloyEvents.run(SystemEvents.highlight(), (comp, se) => {
            AlloyTriggers.emit(comp, ShowTooltipEvent);
          }),
          AlloyEvents.run(SystemEvents.dehighlight(), (comp) => {
            AlloyTriggers.emit(comp, HideTooltipEvent);
          }),
        ]
    )
  ]));

};

export { events };
