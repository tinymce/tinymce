import { AlloyComponent, GuiFactory, SimpleSpec, TooltippingTypes } from '@ephox/alloy';
import { Fun, Result } from '@ephox/katamari';

interface TooltipConfigSpec {
  readonly tooltipText: string;
  readonly onShow?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  readonly onHide?: (comp: AlloyComponent, tooltip: AlloyComponent) => void;
  readonly onSetup?: (comp: AlloyComponent) => void;
}
export interface TooltipsProvider {
  readonly getConfig: (spec: TooltipConfigSpec) => TooltippingTypes.TooltippingConfigSpec;
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

  const getConfig = (spec: TooltipConfigSpec) => {
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
      onHide: (comp: AlloyComponent, tooltip: AlloyComponent) => {
        numActiveTooltips--;
        if (spec.onHide) {
          spec.onHide(comp, tooltip);
        }
      },
      onSetup: spec.onSetup,
    };
  };

  return {
    getConfig,
    getComponents
  };

};
