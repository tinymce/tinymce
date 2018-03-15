import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

export interface ComposingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ComposingConfig) => { [key: string]: (any) => any };
  getCurrent: (sandbox: AlloyComponent) => any;
}
export interface ComposingConfig {
  find: (container: AlloyComponent) => Option<AlloyComponent>;
}
export interface ComposingCreateConfig {
  apis: {
    getCurrent: (component: AlloyComponent, componentConfig: ComposingConfig, composeState: {}) => Option<AlloyComponent>
  };
}

const Composing = Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
}) as ComposingBehaviour;

export {
  Composing
};