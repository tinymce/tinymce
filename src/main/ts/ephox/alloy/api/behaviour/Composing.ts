import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';

export interface ComposingBehaviour extends AlloyBehaviour {
  config: (ComposingConfig) => any;
}
export interface ComposingConfig<T> {
  find: Option<T>;
}
export interface ComposingCreateConfig extends AlloyBehaviourConfig {
  apis: {
    getCurrent: (component, componentConfig, composeState) => any
  };
}
// extends AlloyBehaviourConfig

const Composing: ComposingBehaviour = Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
});

export {
  Composing
};