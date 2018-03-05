import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { ComposingConfig } from 'ephox/alloy/api/behaviour/Composing';

const getCurrent = function <T>(component: AlloyComponent, composeConfig: ComposingConfig<T>, composeState: {}): Option<T> {
  return composeConfig.find()(component);
};

export {
  getCurrent
};