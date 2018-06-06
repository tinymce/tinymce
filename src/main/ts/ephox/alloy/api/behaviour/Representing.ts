import * as Behaviour from './Behaviour';
import * as ActiveRepresenting from '../../behaviour/representing/ActiveRepresenting';
import * as RepresentApis from '../../behaviour/representing/RepresentApis';
import RepresentSchema from '../../behaviour/representing/RepresentSchema';
import * as RepresentState from '../../behaviour/representing/RepresentState';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Result } from '@ephox/katamari';

export interface RepresentingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: RepresentingConfig) => Behaviour.NamedConfiguredBehaviour;
  setValueFrom: (component: AlloyComponent, source: AlloyComponent) => void;
  setValue: (component: AlloyComponent, value: any) => void;
  getValue: (component: AlloyComponent) => any;
}

// NOTE: I'm not sure we have any guarantees on what this can be.
export type RepresentingData = any;

export interface RepresentingConfig {
  store: {
    mode: string,
    initialValue?: any,
    getFallbackEntry?: (key: string) => RepresentingData,
    getDataKey?: (typeAhead: AlloyComponent) => string,
    setData?: (typeAhead: AlloyComponent, data: RepresentingData ) => void;
    getValue?: (...any) => any;
    setValue?: (...any) => void;
  };
  onSetValue?: (comp: AlloyComponent, data: RepresentingData) => void;
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