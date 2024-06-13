import { Replacing } from '../../api/behaviour/Replacing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { ExclusivityChannel, ImmediateHideTooltipEvent, ImmediateShowTooltipEvent } from './TooltippingCommunication';
import { TooltippingConfig, TooltippingState } from './TooltippingTypes';

const hideAllExclusive = (component: AlloyComponent, _tConfig: TooltippingConfig, _tState: TooltippingState): void => {
  component.getSystem().broadcastOn([ ExclusivityChannel ], { });
};

const setComponents = (_component: AlloyComponent, _tConfig: TooltippingConfig, tState: TooltippingState, specs: AlloySpec[]): void => {
  tState.getTooltip().each((tooltip) => {
    if (tooltip.getSystem().isConnected()) {
      Replacing.set(tooltip, specs);
    }
  });
};

const isEnabled = (_component: AlloyComponent, _tConfig: TooltippingConfig, tState: TooltippingState): boolean =>
  tState.isEnabled();

const setEnabled = (_component: AlloyComponent, _tConfig: TooltippingConfig, tState: TooltippingState, enabled: boolean): void =>
  tState.setEnabled(enabled);

const immediateOpenClose = (component: AlloyComponent, _tConfig: TooltippingConfig, _tState: TooltippingState, open: boolean): void =>
  AlloyTriggers.emit(component, open ? ImmediateShowTooltipEvent : ImmediateHideTooltipEvent);

export {
  hideAllExclusive,
  immediateOpenClose,
  isEnabled,
  setComponents,
  setEnabled
};
