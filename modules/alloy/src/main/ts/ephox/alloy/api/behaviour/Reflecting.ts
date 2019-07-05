import * as Behaviour from './Behaviour';
import * as ReflectingApis from '../../behaviour/reflecting/ReflectingApis';
import * as ActiveReflecting from '../../behaviour/reflecting/ActiveReflecting';
import * as ReflectingState from '../../behaviour/reflecting/ReflectingState';
import ReflectingSchema from '../../behaviour/reflecting/ReflectingSchema';
import { ReflectingBehaviour } from '../../behaviour/reflecting/ReflectingTypes';

const Reflecting = Behaviour.create({
  fields: ReflectingSchema,
  name: 'reflecting',
  active: ActiveReflecting,
  apis: ReflectingApis,
  state: ReflectingState
}) as ReflectingBehaviour<any, any>;

export {
  Reflecting
};
