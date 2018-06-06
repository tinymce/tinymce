import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ComposingConfig } from '../../behaviour/composing/ComposingTypes';
import { Stateless } from 'ephox/alloy/behaviour/common/NoState';

const getCurrent = function (component: AlloyComponent, composeConfig: ComposingConfig, composeState: Stateless): Option<AlloyComponent> {
  return composeConfig.find()(component);
};

export {
  getCurrent
};