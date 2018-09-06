import { TooltippingConfig, TooltippingState } from './TooltippingTypes';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { ExclusivityChannel } from './TooltippingCommunication';

const hideAllExclusive = (component: AlloyComponent, tConfig: TooltippingConfig, tState: TooltippingState): void => {
  component.getSystem().broadcastOn([ ExclusivityChannel ], { });
};

export {
  hideAllExclusive
};