import * as ActiveDocking from '../../behaviour/docking/ActiveDocking';
import * as DockingApis from '../../behaviour/docking/DockingApis';
import DockingSchema from '../../behaviour/docking/DockingSchema';
import * as DockingState from '../../behaviour/docking/DockingState';
import { DockingBehaviour } from '../../behaviour/docking/DockingTypes';

import * as Behaviour from './Behaviour';

const Docking: DockingBehaviour = Behaviour.create({
  fields: DockingSchema,
  name: 'docking',
  active: ActiveDocking,
  apis: DockingApis,
  state: DockingState
});

export {
  Docking
};
