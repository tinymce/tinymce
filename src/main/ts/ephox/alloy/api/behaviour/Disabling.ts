import * as Behaviour from './Behaviour';
import * as ActiveDisable from '../../behaviour/disabling/ActiveDisable';
import * as DisableApis from '../../behaviour/disabling/DisableApis';
import DisableSchema from '../../behaviour/disabling/DisableSchema';
import { AlloyBehaviour, AlloyBehaviourCreate } from 'ephox/alloy/alien/TypeDefinitions';

export interface DisableBehaviour extends AlloyBehaviour {
  config: (DisablingConfig) => any;
}

export interface DisablingConfig<T> extends AlloyBehaviourCreate {
  active: {
    exhibit: (base: {}, disableConfig: {DisableConfig}, disableState?) => any,
    events: (disableConfig, disableState) => any
  };
}

export interface DisableConfig {
  disabled: () => boolean;
  disableClass: () => string;
}

const Disabling: DisableBehaviour = Behaviour.create({
  fields: DisableSchema,
  name: 'disabling',
  active: ActiveDisable,
  apis: DisableApis
});

export {
  Disabling
};