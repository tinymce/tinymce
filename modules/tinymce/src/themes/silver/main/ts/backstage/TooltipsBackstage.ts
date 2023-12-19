import { AlloyComponent, GuiFactory, TooltippingTypes } from '@ephox/alloy';
import { Fun, Result } from '@ephox/katamari';

export interface TooltipsProvider {
  readonly getConfig: (spec: { tooltipText: string }) => TooltippingTypes.TooltippingConfigSpec;
}

export const TooltipsBackstage = (
  getSink: () => Result<AlloyComponent, any>
): TooltipsProvider => {

  // TODO: TINY-10475: Update delay to find suitable duration on hover to show tooltip
  const tooltipDelay = 800;
  const intervalDelay = tooltipDelay * 0.2;   // Arbitrary value

  let numActiveTooltips = 0;

  const alreadyShowingTooltips = () => numActiveTooltips > 0;

  const getConfig = (spec: { tooltipText: string }) => ({
    delayForShow: () => alreadyShowingTooltips() ? intervalDelay : tooltipDelay,
    delayForHide: Fun.constant(tooltipDelay),
    exclusive: true,
    lazySink: getSink,
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
