import type { Optional } from '@ephox/katamari';

import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { Stateless } from '../../behaviour/common/BehaviourState';
import type { ComposingConfig } from '../../behaviour/composing/ComposingTypes';

const getCurrent = (component: AlloyComponent, composeConfig: ComposingConfig, _composeState: Stateless): Optional<AlloyComponent> => composeConfig.find(component);

export {
  getCurrent
};
