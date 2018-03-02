import * as Behaviour from './Behaviour';
import Representing from './Representing';
import * as ActiveInvalidate from '../../behaviour/invalidating/ActiveInvalidate';
import * as InvalidateApis from '../../behaviour/invalidating/InvalidateApis';
import InvalidateSchema from '../../behaviour/invalidating/InvalidateSchema';
import { Future, Result } from '@ephox/katamari';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';
import { Component } from 'ephox/alloy/api/Main';

export interface InvalidatingBehaviour extends AlloyBehaviour {
  config: (InvalidatingConfig) => any;
  markValid?: (Component: AlloyComponent) => void;
  markInvalid?: (Component: AlloyComponent) => void;
  query?: <T>(Component: AlloyComponent) => Future<T>;
  run?: <T>(Component: AlloyComponent) => Future<T>;
  validation?: (validate: (v: string) => Result<any, string>) => (component: AlloyComponent) => any;
}

export interface InvalidatingConfig extends AlloyBehaviourConfig {
  invalidClass: string;
  onEvent: string;
  getRoot: () => any;
  validator: {
    validate: <T>(input: AlloyComponent) => Future<T>
  };
}

const Invalidating: InvalidatingBehaviour = Behaviour.create({
  fields: InvalidateSchema,
  name: 'invalidating',
  active: ActiveInvalidate,
  apis: InvalidateApis,

  extra: {
    // Note, this requires representing to be on the validatee
    validation (validator) {
      return function (component) {
        const v = Representing.getValue(component);
        return Future.pure(validator(v));
      };
    }
  }
});

export {
  Invalidating
};