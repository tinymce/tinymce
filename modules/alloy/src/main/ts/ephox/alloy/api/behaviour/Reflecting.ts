import * as ActiveReflecting from '../../behaviour/reflecting/ActiveReflecting';
import * as ReflectingApis from '../../behaviour/reflecting/ReflectingApis';
import ReflectingSchema from '../../behaviour/reflecting/ReflectingSchema';
import * as ReflectingState from '../../behaviour/reflecting/ReflectingState';
import { ReflectingBehaviour } from '../../behaviour/reflecting/ReflectingTypes';
import * as Behaviour from './Behaviour';

const Reflecting: ReflectingBehaviour<any, any> = Behaviour.create({
  fields: ReflectingSchema,
  name: 'reflecting',
  active: ActiveReflecting,
  apis: ReflectingApis,
  state: ReflectingState
});

export {
  Reflecting
};
