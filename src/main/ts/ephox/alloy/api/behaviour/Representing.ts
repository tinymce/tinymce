import * as Behaviour from './Behaviour';
import * as ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import * as RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import * as RepresentState from '../../behaviour/representing/RepresentState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Result } from '@ephox/katamari';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: RepresentingConfig) => { [key: string]: (any) => any };
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
}

export interface RepresentingConfig {
  store: {
    mode: string,
    initialValue?: any,
    getFallbackEntry?: (key: string) => { value: string, text: string },
    getDataKey?: (typeAhead: AlloyComponent) => string,
    setData?: (typeAhead: AlloyComponent, data: { text, value: string } ) => void;
    getValue?: (any) => any;
    setValue?: (...any) => any;
  };
  onSetValue?: <T, E>() => Result<T, E>;
}

// The self-reference is clumsy.
const Representing = Behaviour.create({
  fields: RepresentSchema,
  name: 'representing',
  active: ActiveRepresenting,
  apis: RepresentApis,
  extra: {
    setValueFrom (component: AlloyComponent, source: AlloyComponent) {
      const value = Representing.getValue(source);
      Representing.setValue(component, value);
    }
  },
  state: RepresentState
}) as RepresentingBehaviour;

export {
  Representing
};