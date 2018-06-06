import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';

export interface ComposingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: ComposingConfig) => Behaviour.NamedConfiguredBehaviour;
  getCurrent: (sandbox: AlloyComponent | any) => Option<AlloyComponent>;
}
export interface ComposingConfig {
  find: any;
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