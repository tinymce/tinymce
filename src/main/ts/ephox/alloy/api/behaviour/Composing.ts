import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface ComposingBehaviour extends Behaviour.AlloyBehaviour {
  config: (ComposingConfig) => { key: string, value: any };
  getCurrent?: (any) => any; // TODO any : whats sandbox
}
export interface ComposingConfig<T> {
  find: () => (AlloyComponent) => Option<T>;
}
export interface ComposingCreateConfig extends Behaviour.AlloyBehaviourConfig {
  apis: {
    getCurrent: <T>(component: AlloyComponent, componentConfig: ComposingConfig<T>, composeState: {}) => any
  };
}

const Composing: ComposingBehaviour = Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
});

export {
  Composing
};