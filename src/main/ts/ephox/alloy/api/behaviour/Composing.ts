import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';

export interface ComposingBehaviour extends AlloyBehaviour {
  config: (ComposingConfig) => any;
  getCurrent?: (any) => any; // TODO any : whats sandbox
}
export interface ComposingConfig<T> {
  find: () => (AlloyComponent) => Option<T>;
}
export interface ComposingCreateConfig extends AlloyBehaviourConfig {
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