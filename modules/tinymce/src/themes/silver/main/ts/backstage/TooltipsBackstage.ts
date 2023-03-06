import { AlloyComponent, GuiFactory, TooltippingTypes } from '@ephox/alloy';
import { Fun, Result } from '@ephox/katamari';

export interface TooltipsProvider {
  readonly getConfig: (spec: { tooltipText: string }) => TooltippingTypes.TooltippingConfigSpec;
}

export const TooltipsBackstage = (
  getSink: () => Result<AlloyComponent, any>
): TooltipsProvider => {

  const tooltipDelay = 800;
  const intervalDelay = tooltipDelay * 0.2;   // Arbitrary value

  let numActiveTooltips = 0;

  const alreadyShowingTooltips = () => numActiveTooltips > 0;

  const getConfig = (spec: { tooltipText: string }) => ({
    delayForShow: () => alreadyShowingTooltips() ? intervalDelay : tooltipDelay,
    delayForHide: Fun.constant(tooltipDelay),
    exclusive: true,
    lazySink: getSink,
    /*
      <div class="tox-tooltip tox-tooltip--down">
  <div class="tox-tooltip__body">Are you hanging on the edge of your seat? </div>
  <i class="tox-tooltip__arrow"></i>
  </div>*/
    tooltipDom: {
      tag: 'div',
      classes: [ 'tox-tooltip', 'tox-tooltip--up' ]
    },
    tooltipComponents: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-tooltip__body' ]
        },
        components: [
          GuiFactory.text(spec.tooltipText)
        ]
      },
      // Figma design does not include tooltip arrow
      // {
      //   dom: {
      //     tag: 'i',
      //     classes: [ 'tox-tooltip__arrow' ]
      //   }
      // }
    ],
    onShow: () => {
      numActiveTooltips++;
    },
    onHide: () => {
      numActiveTooltips--;
    }
  });

  return {
    getConfig
  };

};
