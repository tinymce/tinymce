import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { ComposingConfig } from 'ephox/alloy/api/behaviour/Composing';

const getCurrent = function (component: AlloyComponent, composeConfig: ComposingConfig, composeState: {}): Option<AlloyComponent> {
  return composeConfig.find(component);
};

export {
  getCurrent
};