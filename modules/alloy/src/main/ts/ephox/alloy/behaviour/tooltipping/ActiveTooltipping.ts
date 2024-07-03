import { Arr, Fun } from '@ephox/katamari';
import { EventArgs, Focus, SelectorFind, Selectors } from '@ephox/sugar';

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
import { ExclusivityChannel, HideTooltipEvent, ImmediateHideTooltipEvent, ImmediateShowTooltipEvent, ShowTooltipEvent } from './TooltippingCommunication';
import { TooltippingConfig, TooltippingState } from './TooltippingTypes';

const events = (tooltipConfig: TooltippingConfig, state: TooltippingState): AlloyEvents.AlloyEventRecord => {
  const hide = (comp: AlloyComponent) => {
    state.getTooltip().each((p) => {
      if (p.getSystem().isConnected()) {
        Attachment.detach(p);
        tooltipConfig.onHide(comp, p);
        state.clearTooltip();
      }
    });
    state.clearTimer();
  };

  const show = (comp: AlloyComponent) => {
    if (!state.isShowing() && state.isEnabled()) {
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
      Positioning.position(sink, popup, { anchor: tooltipConfig.anchor(comp) });
    }
  };

  const reposition = (comp: AlloyComponent) => {
    state.getTooltip().each((tooltip) => {
      const sink = tooltipConfig.lazySink(comp).getOrDie();
      Positioning.position(sink, tooltip, { anchor: tooltipConfig.anchor(comp) });
    });
  };

  const getEvents = () => {
    switch (tooltipConfig.mode) {
      case 'normal':
        return [
          AlloyEvents.run(NativeEvents.focusin(), (comp) => {
            AlloyTriggers.emit(comp, ImmediateShowTooltipEvent);
          }),
          AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
            AlloyTriggers.emit(comp, ImmediateHideTooltipEvent);
          }),
          AlloyEvents.run(NativeEvents.mouseover(), (comp) => {
            AlloyTriggers.emit(comp, ShowTooltipEvent);
          }),
          AlloyEvents.run(NativeEvents.mouseout(), (comp) => {
            AlloyTriggers.emit(comp, HideTooltipEvent);
          })
        ];
      case 'follow-highlight':
        return [
          AlloyEvents.run(SystemEvents.highlight(), (comp, _se) => {
            AlloyTriggers.emit(comp, ShowTooltipEvent);
          }),
          AlloyEvents.run(SystemEvents.dehighlight(), (comp) => {
            AlloyTriggers.emit(comp, HideTooltipEvent);
          })
        ];
      case 'children-normal':
        return [
          AlloyEvents.run(NativeEvents.focusin(), (comp, se) => {
            Focus.search(comp.element).each((_) => {
              if (Selectors.is(se.event.target, '[data-mce-tooltip]')) {
                state.getTooltip().fold(() => {
                  AlloyTriggers.emit(comp, ImmediateShowTooltipEvent);
                },
                (tooltip) => {
                  if (state.isShowing()) {
                    tooltipConfig.onShow(comp, tooltip);
                    reposition(comp);
                  }
                });
              }
            });
          }),
          AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
            Focus.search(comp.element).fold(() => {
              AlloyTriggers.emit(comp, ImmediateHideTooltipEvent);
            }, Fun.noop);
          }),
          AlloyEvents.run<EventArgs>(NativeEvents.mouseover(), (comp) => {
            SelectorFind.descendant(comp.element, '[data-mce-tooltip]:hover').each((_) => {
              state.getTooltip().fold(() => {
                AlloyTriggers.emit(comp, ShowTooltipEvent);
              }, (tooltip) => {
                if (state.isShowing()) {
                  tooltipConfig.onShow(comp, tooltip);
                  reposition(comp);
                }
              });
            });
          }),
          AlloyEvents.run(NativeEvents.mouseout(), (comp) => {
            SelectorFind.descendant(comp.element, '[data-mce-tooltip]:hover').fold(() => {
              AlloyTriggers.emit(comp, HideTooltipEvent);
            }, Fun.noop);
          }),
        ];
      default:
        return [
          AlloyEvents.run(NativeEvents.focusin(), (comp, se) => {
            Focus.search(comp.element).each((_) => {
              if (Selectors.is(se.event.target, '[data-mce-tooltip]')) {
                state.getTooltip().fold(() => {
                  AlloyTriggers.emit(comp, ImmediateShowTooltipEvent);
                },
                (tooltip) => {
                  if (state.isShowing()) {
                    tooltipConfig.onShow(comp, tooltip);
                    reposition(comp);
                  }
                });
              }
            });
          }),
          AlloyEvents.run(SystemEvents.postBlur(), (comp) => {
            Focus.search(comp.element).fold(() => {
              AlloyTriggers.emit(comp, ImmediateHideTooltipEvent);
            }, Fun.noop);
          }),
        ];
    }
  };

  return AlloyEvents.derive(Arr.flatten([
    [
      AlloyEvents.runOnInit((component) => {
        tooltipConfig.onSetup(component);
      }),
      AlloyEvents.run(ShowTooltipEvent, (comp) => {
        state.resetTimer(() => {
          show(comp);
        }, tooltipConfig.delayForShow());
      }),
      AlloyEvents.run(HideTooltipEvent, (comp) => {
        state.resetTimer(() => {
          hide(comp);
        }, tooltipConfig.delayForHide());
      }),
      AlloyEvents.run(ImmediateShowTooltipEvent, (comp) => {
        state.resetTimer(() => {
          show(comp);
        }, 0);
      }),
      AlloyEvents.run(ImmediateHideTooltipEvent, (comp) => {
        state.resetTimer(() => {
          hide(comp);
        }, 0);
      }),
      AlloyEvents.run(SystemEvents.receive(), (comp, message) => {
        // TODO: Think about the types for this, or find a better way for this
        // to rely on receiving.
        const receivingData = message as unknown as ReceivingInternalEvent;
        if (!receivingData.universal) {
          if (Arr.contains(receivingData.channels, ExclusivityChannel)) {
            hide(comp);
          }
        }
      }),
      AlloyEvents.runOnDetached((comp) => {
        hide(comp);
      })
    ],
    (
      getEvents()
    )
  ]));

};

export { events };
