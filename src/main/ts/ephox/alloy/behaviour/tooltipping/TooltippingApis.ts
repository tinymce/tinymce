import { Arr, Option, Options, Result } from '@ephox/katamari';
import { Class, SelectorFilter, SelectorFind, Element } from '@ephox/sugar';

import * as Cycles from '../../alien/Cycles';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { HighlightingConfig } from '../../behaviour/highlighting/HighlightingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { TooltippingConfig, TooltippingState } from 'ephox/alloy/behaviour/tooltipping/TooltippingTypes';
import { ExclusivityChannel } from './TooltippingCommunication';

const hideAllExclusive = (component: AlloyComponent, tConfig: TooltippingConfig, tState: TooltippingState): void => {
  component.getSystem().broadcastOn([ ExclusivityChannel ], { });
}

export {
  hideAllExclusive
};