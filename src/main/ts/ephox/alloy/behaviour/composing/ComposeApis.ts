import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ComposingConfig } from '../../behaviour/composing/ComposingTypes';

const getCurrent = function (component: AlloyComponent, composeConfig: ComposingConfig, composeState: {}): Option<AlloyComponent> {
  return composeConfig.find()(component);
};

export {
  getCurrent
};