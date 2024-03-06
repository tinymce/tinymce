import { AlloyComponent, GuiFactory, SimpleSpec, TooltippingTypes } from '@ephox/alloy';
import { Fun, Result } from '@ephox/katamari';

export interface TooltipsProvider {
  readonly getConfig: (spec: { tooltipText: string; onShow?: (comp: AlloyComponent, tooltip: AlloyComponent) => void }) => TooltippingTypes.TooltippingConfigSpec;
  readonly getComponents: (spec: { tooltipText: string }) => SimpleSpec[];
}

export const TooltipsBackstage = (
  getSink: () => Result<AlloyComponent, any>
): TooltipsProvider => {

  const tooltipDelay = 300;
  const intervalDelay = tooltipDelay * 0.2;   // Arbitrary value

  let numActiveTooltips = 0;

  const alreadyShowingTooltips = () => numActiveTooltips > 0;

  const getComponents = (spec: { tooltipText: string }): SimpleSpec[] => {
    return [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-tooltip__body' ]
        },
        components: [
          GuiFactory.text(spec.tooltipText)
        ]
      }
    ];
  };

  const getConfig = (spec: { tooltipText: string; onShow?: (comp: AlloyComponent, tooltip: AlloyComponent) => void }) => {
    return {
      delayForShow: () => alreadyShowingTooltips() ? intervalDelay : tooltipDelay,
      delayForHide: Fun.constant(tooltipDelay),
      exclusive: true,
      lazySink: getSink,
      tooltipDom: {
        tag: 'div',
        classes: [ 'tox-tooltip', 'tox-tooltip--up' ]
      },
      tooltipComponents: getComponents(spec),
      onShow: (comp: AlloyComponent, tooltip: AlloyComponent) => {
        numActiveTooltips++;
        if (spec.onShow) {
          spec.onShow(comp, tooltip);
        }
      },
      onHide: () => {
        numActiveTooltips--;
      }
    };
  };

  return {
    getConfig,
    getComponents
  };

};
