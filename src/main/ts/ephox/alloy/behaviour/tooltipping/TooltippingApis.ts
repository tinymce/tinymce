import { TooltippingConfig, TooltippingState } from './TooltippingTypes';

import { Replacing } from '../../api/behaviour/Replacing';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { ExclusivityChannel } from './TooltippingCommunication';
import { AlloySpec } from '../../api/component/SpecTypes';

const hideAllExclusive = (component: AlloyComponent, tConfig: TooltippingConfig, tState: TooltippingState): void => {
  component.getSystem().broadcastOn([ ExclusivityChannel ], { });
};

const setComponents = (component: AlloyComponent, tConfig: TooltippingConfig, tState: TooltippingState, specs: AlloySpec[]): void => {
  tState.getTooltip().each((tooltip) => {
    if (tooltip.getSystem().isConnected()) {
      Replacing.set(tooltip, specs);
    }
  });
};

export {
  hideAllExclusive,
  setComponents
};